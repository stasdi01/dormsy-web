const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");

/**
 * POST /auth/sign-up
 * Validates .edu domain → creates Supabase Auth user → returns status
 */
router.post("/sign-up", async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Must be a .edu email
  if (!email.toLowerCase().endsWith(".edu")) {
    return res.status(400).json({ error: "You must use a .edu email address" });
  }

  const domain = email.toLowerCase().split("@")[1];

  // Check if college is supported
  const { data: college } = await supabase
    .from("colleges")
    .select("id, name, is_active")
    .eq("email_domain", domain)
    .single();

  if (!college || !college.is_active) {
    // Save to waitlist
    await supabase.from("waitlist").insert({
      email: email.toLowerCase(),
      college_name: domain,
    });
    return res.status(200).json({
      status: "unsupported",
      message: "College not yet supported",
      email,
    });
  }

  // Create the Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: false,
    user_metadata: {
      first_name,
      last_name,
      college_id: college.id,
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    return res.status(400).json({ error: authError.message });
  }

  // Send verification email via Supabase
  await supabase.auth.admin.generateLink({
    type: "signup",
    email: email.toLowerCase(),
  });

  // Create the user profile row
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    college_id: college.id,
    first_name,
    last_name,
    email: email.toLowerCase(),
    username: null, // set during profile setup
  });

  if (profileError) {
    console.error("Profile insert error:", profileError);
  }

  return res.status(201).json({
    status: "verification_sent",
    message: "Check your email for a verification link",
  });
});

/**
 * POST /auth/resend-verification
 * Resends the verification email
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

/**
 * POST /auth/profile-setup
 * Sets the username and optional fields after first verification
 */
router.post("/profile-setup", requireAuth, async (req, res) => {
  const { username, phone, instagram, avatar_url } = req.body;
  const userId = req.user.id;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // Validate username format
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({
      error: "Username must be 3–20 characters and contain only letters, numbers, or underscores",
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

  const { error } = await supabase
    .from("users")
    .update({
      username: username.toLowerCase(),
      phone: phone || null,
      instagram: instagram ? instagram.replace(/^@/, "") : null,
      avatar_url: avatar_url || null,
    })
    .eq("id", userId);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ message: "Profile setup complete" });
});

/**
 * GET /auth/check-username?username=xxx
 * Real-time username availability check
 */
router.get("/check-username", async (req, res) => {
  const { username, userId } = req.query;
  if (!username) return res.status(400).json({ error: "Username is required" });

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.json({ available: false, reason: "Invalid format" });
  }

  const query = supabase
    .from("users")
    .select("id")
    .eq("username", username.toLowerCase());

  if (userId) query.neq("id", userId);

  const { data } = await query.single();

  return res.json({ available: !data });
});

/**
 * GET /auth/me
 * Returns the authenticated user's profile
 */
router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.userProfile });
});

module.exports = router;
