const supabase = require("../lib/supabase");

/**
 * Validates the Supabase JWT from the Authorization header.
 * Attaches req.user (Supabase auth user) and req.userProfile (users table row).
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  // Verify the token with Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Fetch the user's profile from the users table
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*, college:colleges(*)")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return res.status(401).json({ error: "User profile not found" });
  }

  req.user = user;
  req.userProfile = profile;
  next();
}

module.exports = { requireAuth };
