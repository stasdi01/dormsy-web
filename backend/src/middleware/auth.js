const supabase = require("../lib/supabase");

/**
 * Validates the Supabase JWT only — attaches req.user.
 * Use this for endpoints that run before a profile row exists (e.g. create-profile).
 */
async function requireJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

/**
 * Validates the Supabase JWT and requires a profile row in the users table.
 * Attaches req.user and req.userProfile.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

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

module.exports = { requireAuth, requireJwt };
