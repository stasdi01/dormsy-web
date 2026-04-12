const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");

/**
 * GET /saved
 * Returns all saved listings for the authenticated user
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("saved_listings")
    .select(`
      *,
      listing:listings!listing_id(
        *,
        listing_photos(id, storage_url, order_index),
        seller:users!user_id(id, username, avatar_url)
      )
    `)
    .eq("user_id", userId)
    .eq("listing.status", "active")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Filter out saves where the listing was deleted/sold
  const active = data.filter((s) => s.listing !== null);

  return res.json({ saved: active });
});

/**
 * GET /saved/ids
 * Returns just the listing_ids the user has saved (lightweight, for feed)
 */
router.get("/ids", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ saved: data });
});

/**
 * POST /saved/:listingId
 * Saves a listing (toggle — saves if not saved, unsaves if saved)
 */
router.post("/:listingId", requireAuth, async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user.id;

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_listings")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    // Unsave
    await supabase
      .from("saved_listings")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);

    return res.json({ saved: false });
  } else {
    // Save
    const { error } = await supabase.from("saved_listings").insert({
      user_id: userId,
      listing_id: listingId,
    });

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ saved: true });
  }
});

/**
 * GET /saved/check/:listingId
 * Returns whether the authenticated user has saved a specific listing
 */
router.get("/check/:listingId", requireAuth, async (req, res) => {
  const { listingId } = req.params;
  const userId = req.user.id;

  const { data } = await supabase
    .from("saved_listings")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  return res.json({ saved: !!data });
});

module.exports = router;
