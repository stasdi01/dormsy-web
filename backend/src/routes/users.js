const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");

/**
 * GET /users/:username
 * Returns a public user profile (read-only)
 */
router.get("/:username", requireAuth, async (req, res) => {
  const { username } = req.params;
  const viewerCollegeId = req.userProfile.college_id;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, first_name, created_at, phone, instagram, college:colleges(name), college_id")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });

  // Enforce college boundary — only show users from same college
  if (user.college_id !== viewerCollegeId) {
    return res.status(403).json({ error: "User not in your college" });
  }

  // Get stats
  const { count: totalListings } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "deleted");

  const { count: totalSold } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "sold");

  // Get active listings
  const { data: listings } = await supabase
    .from("listings")
    .select(`*, listing_photos(id, storage_url, order_index)`)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      phone: user.phone,
      instagram: user.instagram,
      college: user.college,
    },
    stats: {
      total_listings: totalListings || 0,
      total_sold: totalSold || 0,
    },
    listings: listings || [],
  });
});

/**
 * PATCH /users/me
 * Updates the authenticated user's profile
 */
router.patch("/me", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, username, phone, instagram, avatar_url } = req.body;

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone || null;
  if (instagram !== undefined) updates.instagram = instagram ? instagram.replace(/^@/, "") : null;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url || null;

  if (username !== undefined) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: "Invalid username format" });
    }
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .neq("id", userId)
      .single();

    if (existing) return res.status(409).json({ error: "Username is already taken" });
    updates.username = username.toLowerCase();
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ user: data });
});

/**
 * DELETE /users/me
 * Deletes the authenticated user's account and all their data
 */
router.delete("/me", requireAuth, async (req, res) => {
  const userId = req.user.id;

  // Soft-delete all user's listings
  await supabase
    .from("listings")
    .update({ status: "deleted" })
    .eq("user_id", userId);

  // Delete user profile
  await supabase.from("users").delete().eq("id", userId);

  // Delete Supabase Auth user
  await supabase.auth.admin.deleteUser(userId);

  return res.json({ message: "Account deleted" });
});

module.exports = router;
