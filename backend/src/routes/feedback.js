const express = require("express");
const { Resend } = require("resend");
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "DormSy <noreply@getdormsy.com>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@getdormsy.com";

const CATEGORY_LABELS = {
  bug: "Bug Report",
  feature: "Feature Request",
  general: "General Feedback",
};

/**
 * POST /feedback
 * Saves feedback to the database and sends email to support.
 */
router.post("/", requireAuth, async (req, res) => {
  const { rating, category, message } = req.body;
  const userId = req.user.id;

  if (!rating || !category || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (!["bug", "feature", "general"].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  if (message.trim().length < 5) {
    return res.status(400).json({ error: "Message is too short" });
  }

  // Save to database
  const { error: dbError } = await supabase
    .from("feedback")
    .insert({ user_id: userId, rating, category, message: message.trim() });

  if (dbError) {
    console.error("[feedback] DB insert failed:", dbError.message);
    return res.status(500).json({ error: "Failed to save feedback" });
  }

  // Send email (non-blocking — don't fail the request if email fails)
  if (process.env.RESEND_API_KEY) {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const categoryLabel = CATEGORY_LABELS[category] || category;
    const userEmail = req.user.email || "unknown";

    resend.emails.send({
      from: FROM,
      to: SUPPORT_EMAIL,
      subject: `[Feedback] ${categoryLabel} — ${stars}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;margin:0;padding:32px 16px;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
            <div style="background:#00599B;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">DormSy Feedback</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:6px 0;width:90px;">From</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:6px 0;">Category</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;">${categoryLabel}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:6px 0;">Rating</td>
                  <td style="font-size:18px;color:#F59E0B;">${stars}</td>
                </tr>
              </table>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;border:1px solid #E5E7EB;">
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message.trim()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    }).catch((err) => console.error("[feedback] Email send failed:", err.message));
  }

  res.json({ ok: true });
});

module.exports = router;
