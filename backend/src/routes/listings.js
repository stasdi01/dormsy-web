const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const slugify = require("slugify");

// Helper: generate unique slug
async function generateSlug(title, collegeName) {
  const base = slugify(`${title}-${collegeName}`, { lower: true, strict: true });
  let slug = base;
  let attempt = 0;

  while (true) {
    const { data } = await supabase
      .from("listings")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!data) break;
    attempt++;
    slug = `${base}-${attempt}`;
  }

  return slug;
}

/**
 * GET /listings
 * Returns active listings for the authenticated user's college
 * Query params: category, search, page, limit
 */
router.get("/", requireAuth, async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const collegeId = req.userProfile.college_id;
  const offset = (Number(page) - 1) * Number(limit);

  let query = supabase
    .from("listings")
    .select(`
      *,
      listing_photos(id, storage_url, order_index),
      seller:users!user_id(id, username, avatar_url, college_id)
    `, { count: "exact" })
    .eq("college_id", collegeId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    listings: data,
    total: count,
    page: Number(page),
    limit: Number(limit),
  });
});

/**
 * GET /listings/my
 * Returns the authenticated user's own listings (all statuses except deleted)
 */
router.get("/my", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  let query = supabase
    .from("listings")
    .select(`*, listing_photos(id, storage_url, order_index)`)
    .eq("user_id", userId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ listings: data });
});

/**
 * GET /listings/:slug
 * Returns a single listing by slug (public — for SSR on listing detail page)
 * Increments view count if viewer != seller
 */
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      listing_photos(id, storage_url, order_index),
      seller:users!user_id(id, username, avatar_url, first_name, created_at, phone, instagram, college:colleges(name))
    `)
    .eq("slug", slug)
    .neq("status", "deleted")
    .single();

  if (error || !listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  // Increment view count (fire and forget)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user && user.id !== listing.user_id) {
      supabase
        .from("listings")
        .update({ views_count: listing.views_count + 1 })
        .eq("id", listing.id)
        .then(() => {});
    }
  }

  // Saves count
  const { count: savesCount } = await supabase
    .from("saved_listings")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listing.id);

  return res.json({ listing: { ...listing, saves_count: savesCount || 0 } });
});

/**
 * POST /listings
 * Creates a new listing (multipart/json — photos uploaded separately)
 */
router.post("/", requireAuth, async (req, res) => {
  const { title, description, price, category, condition, photo_urls } = req.body;
  const userId = req.user.id;
  const collegeId = req.userProfile.college_id;
  const collegeName = req.userProfile.college?.name || "college";

  if (!title || price === undefined || !category || !condition) {
    return res.status(400).json({ error: "Title, price, category, and condition are required" });
  }

  if (title.length > 60) {
    return res.status(400).json({ error: "Title must be 60 characters or less" });
  }

  if (description && description.length > 300) {
    return res.status(400).json({ error: "Description must be 300 characters or less" });
  }

  if (Number(price) < 0) {
    return res.status(400).json({ error: "Price cannot be negative" });
  }

  const slug = await generateSlug(title, collegeName);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      user_id: userId,
      college_id: collegeId,
      title,
      slug,
      description: description || null,
      price: Number(price),
      category,
      condition,
      status: "active",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Insert photos
  if (photo_urls && photo_urls.length > 0) {
    const photos = photo_urls.slice(0, 3).map((url, index) => ({
      listing_id: listing.id,
      storage_url: url,
      order_index: index,
    }));

    await supabase.from("listing_photos").insert(photos);
  }

  return res.status(201).json({ listing: { ...listing, slug } });
});

/**
 * PATCH /listings/:id
 * Updates a listing (only by owner)
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, price, category, condition, photo_urls } = req.body;

  // Verify ownership
  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });
  if (existing.status === "deleted") return res.status(400).json({ error: "Cannot edit a deleted listing" });

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = Number(price);
  if (category !== undefined) updates.category = category;
  if (condition !== undefined) updates.condition = condition;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Replace photos if provided
  if (photo_urls !== undefined) {
    await supabase.from("listing_photos").delete().eq("listing_id", id);

    if (photo_urls.length > 0) {
      const photos = photo_urls.slice(0, 3).map((url, index) => ({
        listing_id: id,
        storage_url: url,
        order_index: index,
      }));
      await supabase.from("listing_photos").insert(photos);
    }
  }

  return res.json({ listing: updated });
});

/**
 * PATCH /listings/:id/status
 * Changes listing status (mark sold, archive)
 */
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const allowed = ["sold", "active", "archived"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { error } = await supabase
    .from("listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: `Listing marked as ${status}` });
});

/**
 * PATCH /listings/:id/extend
 * Resets the expiry clock to 30 days from now (only available within last 7 days)
 */
router.patch("/:id/extend", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id, status, expires_at")
    .eq("id", id)
    .single();

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });
  if (existing.status !== "active") return res.status(400).json({ error: "Only active listings can be extended" });

  const daysLeft = (new Date(existing.expires_at) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysLeft > 7) {
    return res.status(400).json({ error: "Listing can only be extended within 7 days of expiry" });
  }

  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("listings")
    .update({ expires_at: newExpiry, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: "Listing extended for 30 more days" });
});

/**
 * DELETE /listings/:id
 * Soft-deletes a listing (only by owner)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { data: existing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!existing) return res.status(404).json({ error: "Listing not found" });
  if (existing.user_id !== userId) return res.status(403).json({ error: "Forbidden" });

  const { error } = await supabase
    .from("listings")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: "Listing deleted" });
});

module.exports = router;
