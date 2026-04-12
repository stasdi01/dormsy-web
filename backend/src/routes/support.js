const express = require("express");
const { Resend } = require("resend");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "DormSy <noreply@dormsy.com>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@dormsy.com";

/**
 * POST /support
 * Sends a contact form submission to the DormSy support inbox.
 */
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!process.env.RESEND_API_KEY) {
    // In development without Resend configured, just log and succeed
    console.log("[support] Contact form submission (no Resend key):", { name, email, subject });
    return res.json({ ok: true });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: SUPPORT_EMAIL,
      reply_to: email,
      subject: `[Support] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;margin:0;padding:32px 16px;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
            <div style="background:#00599B;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">DormSy Support</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:6px 0;width:80px;">From</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;">${name} &lt;${email}&gt;</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:6px 0;">Subject</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;">${subject}</td>
                </tr>
              </table>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;border:1px solid #E5E7EB;">
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="padding:16px 32px;border-top:1px solid #F3F4F6;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">Reply directly to this email to respond to the user.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[support] Failed to send email:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
