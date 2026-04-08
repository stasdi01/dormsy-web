const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");

/**
 * POST /auth/sign-up
 * Validates the .edu email domain against the colleges table.
 * Does NOT create the Supabase Auth user — that happens on the frontend
 * via supabase.auth.signUp() so Supabase sends the verification email.
 *
 * Returns:
 *   { status: "supported", college: { id, name } }
 *   { status: "unsupported" }  ← also saves to waitlist
 */
router.post("/sign-up", async (req, res) => {
  const { email, college_name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!email.toLowerCase().endsWith(".edu")) {
    return res.status(400).json({ error: "You must use a .edu email address" });
  }

  const domain = email.toLowerCase().split("@")[1];

  const { data: college } = await supabase
    .from("colleges")
    .select("id, name")
    .eq("email_domain", domain)
    .eq("is_active", true)
    .single();

  if (!college) {
    // Save to waitlist (ignore duplicates)
    await supabase.from("waitlist").upsert(
      { email: email.toLowerCase(), college_name: college_name || domain },
      { onConflict: "email" }
    );
    return res.json({ status: "unsupported" });
  }

  return res.json({ status: "supported", college });
});

/**
 * POST /auth/create-profile
 * Called from the auth callback after email verification.
 * Creates the users table row using the verified session's JWT.
 * first_name and last_name are read from Supabase user_metadata
 * (stored there during signUp on the frontend).
 */
router.post("/create-profile", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email;

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id, username")
    .eq("id", userId)
    .single();

  if (existing) {
    return res.json({ user: existing, already_exists: true });
  }

  // Look up college from email domain
  const domain = email.split("@")[1];
  const { data: college } = await supabase
    .from("colleges")
    .select("id")
    .eq("email_domain", domain)
    .eq("is_active", true)
    .single();

  if (!college) {
    return res.status(403).json({ error: "College not supported" });
  }

  const metadata = req.user.user_metadata || {};

  const { data: profile, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      college_id: college.id,
      email: email.toLowerCase(),
      first_name: metadata.first_name || "",
      last_name: metadata.last_name || "",
      username: null, // set during profile setup
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ user: profile });
});

/**
 * POST /auth/profile-setup
 * Sets username and optional fields (first login only, but can be used for updates too).
 */
router.post("/profile-setup", requireAuth, async (req, res) => {
  const { username, phone, instagram, avatar_url } = req.body;
  const userId = req.user.id;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      error: "Username must be 3–20 characters: letters, numbers, underscores only",
    });
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.toLowerCase())
    .neq("id", userId)
    .single();

  if (existing) {
    return res.status(409).json({ error: "Username is already taken" });
  }

  const { data: updated, error } = await supabase
    .from("users")
    .update({
      username: username.toLowerCase(),
      phone: phone || null,
      instagram: instagram ? instagram.replace(/^@/, "") : null,
      avatar_url: avatar_url || null,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ user: updated });
});

/**
 * GET /auth/check-username?username=xxx&userId=yyy
 * Real-time username availability check (debounced from frontend).
 */
router.get("/check-username", async (req, res) => {
  const { username, userId } = req.query;

  if (!username) return res.status(400).json({ error: "Username required" });

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.json({ available: false, reason: "Invalid format" });
  }

  let query = supabase
    .from("users")
    .select("id")
    .eq("username", username.toLowerCase());

  if (userId) {
    query = query.neq("id", userId);
  }

  const { data } = await query.single();
  return res.json({ available: !data });
});

/**
 * GET /auth/me
 * Returns the authenticated user's full profile.
 */
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.userProfile });
});

/**
 * POST /auth/resend-verification
 * Resends the Supabase verification email.
 */
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.toLowerCase(),
  });

  if (error) return res.status(400).json({ error: error.message });
  return res.json({ message: "Verification email resent" });
});

module.exports = router;
