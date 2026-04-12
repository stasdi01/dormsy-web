const cron = require("node-cron");
const supabase = require("./supabase");
const { sendListingExpiryEmail } = require("./email");

/**
 * Runs daily at 9am UTC.
 * Finds listings expiring in exactly 3 days and emails the owner.
 */
function startCronJobs() {
  cron.schedule("0 9 * * *", async () => {
    console.log("[cron] Running listing expiry check...");

    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Window: listings expiring between 3d0h and 3d1h from now (avoid duplicates on retry)
    const windowStart = new Date(in3Days.getTime()).toISOString();
    const windowEnd = new Date(in3Days.getTime() + 60 * 60 * 1000).toISOString();

    const { data: listings, error } = await supabase
      .from("listings")
      .select(`
        id, title, slug, expires_at,
        owner:users!user_id(email, first_name)
      `)
      .eq("status", "active")
      .gte("expires_at", windowStart)
      .lt("expires_at", windowEnd);

    if (error) {
      console.error("[cron] Failed to fetch expiring listings:", error.message);
      return;
    }

    console.log(`[cron] Found ${listings.length} listings expiring soon.`);

    for (const listing of listings) {
      if (!listing.owner?.email) continue;
      await sendListingExpiryEmail({
        toEmail: listing.owner.email,
        toName: listing.owner.first_name,
        listingTitle: listing.title,
        listingSlug: listing.slug,
        expiresAt: listing.expires_at,
      });
    }

    console.log("[cron] Expiry emails sent.");
  });

  console.log("[cron] Jobs scheduled.");
}

module.exports = { startCronJobs };
