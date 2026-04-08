const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");

/**
 * GET /colleges
 * Returns all active colleges (for the landing page "available at" section)
 */
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("colleges")
    .select("id, name, email_domain")
    .eq("is_active", true)
    .order("name");

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ colleges: data });
});

/**
 * POST /colleges/waitlist
 * Saves a waitlist entry for an unsupported college
 */
router.post("/waitlist", async (req, res) => {
  const { email, college_name } = req.body;

  if (!email || !college_name) {
    return res.status(400).json({ error: "Email and college name are required" });
  }

  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase().trim(),
    college_name: college_name.trim(),
  });

  if (error) {
    // Ignore duplicate entries gracefully
    if (error.code === "23505") {
      return res.json({ message: "You're already on the waitlist" });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: "Added to waitlist successfully" });
});

module.exports = router;
