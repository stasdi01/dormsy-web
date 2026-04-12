const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "DormSy <noreply@dormsy.com>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Send a new message notification to the receiver
 */
async function sendNewMessageEmail({ toEmail, toName, fromUsername, listingTitle, listingSlug, messagePreview }) {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: `New message from @${fromUsername} on DormSy`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;margin:0;padding:32px 16px;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
            <!-- Header -->
            <div style="background:#00599B;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">DormSy</p>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">
                You have a new message
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">
                <strong style="color:#111827;">@${fromUsername}</strong> sent you a message about
                <strong style="color:#111827;">${listingTitle}</strong>
              </p>

              <!-- Message preview -->
              <div style="background:#F3F4F6;border-radius:12px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${messagePreview}"</p>
              </div>

              <a href="${FRONTEND_URL}/messages" style="display:inline-block;background:#00599B;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:12px;">
                Reply to message
              </a>
            </div>
            <!-- Footer -->
            <div style="padding:16px 32px;border-top:1px solid #F3F4F6;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                You're receiving this because someone messaged you on DormSy.
                <br/>You can manage notification preferences in your account settings.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("[email] sendNewMessageEmail failed:", err.message);
  }
}

/**
 * Send a listing expiry warning (3 days left)
 */
async function sendListingExpiryEmail({ toEmail, toName, listingTitle, listingSlug, expiresAt }) {
  if (!process.env.RESEND_API_KEY) return;

  const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: `Your listing "${listingTitle}" expires in 3 days`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9FAFB;margin:0;padding:32px 16px;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">
            <!-- Header -->
            <div style="background:#00599B;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">DormSy</p>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <div style="background:#FEF9E7;border:1px solid #FCD34D;border-radius:12px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#D97706;">⏰ Expiring soon</p>
              </div>

              <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">
                Your listing is about to expire
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#6B7280;">
                <strong style="color:#111827;">${listingTitle}</strong> will expire on
                <strong style="color:#111827;">${expiryDate}</strong>.
                Extend it for another 30 days to keep it visible to buyers.
              </p>

              <div style="display:flex;gap:12px;">
                <a href="${FRONTEND_URL}/listings/${listingSlug}" style="display:inline-block;background:#00599B;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:12px;margin-right:12px;">
                  View listing
                </a>
                <a href="${FRONTEND_URL}/my-listings" style="display:inline-block;background:#F3F4F6;color:#374151;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:12px;">
                  My listings
                </a>
              </div>
            </div>
            <!-- Footer -->
            <div style="padding:16px 32px;border-top:1px solid #F3F4F6;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                You're receiving this because you have an active listing on DormSy.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("[email] sendListingExpiryEmail failed:", err.message);
  }
}

module.exports = { sendNewMessageEmail, sendListingExpiryEmail };
