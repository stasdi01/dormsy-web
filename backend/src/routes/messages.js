const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { sendNewMessageEmail } = require("../lib/email");

/**
 * GET /messages
 * Returns all conversations for the authenticated user
 */
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;

  // Get all messages where user is sender or receiver, grouped by listing + other user
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id, listing_id, sender_id, receiver_id, content, is_read, created_at,
      listing:listings!listing_id(id, title, slug, status, price, condition, listing_photos(storage_url, order_index)),
      sender:users!sender_id(id, username, avatar_url),
      receiver:users!receiver_id(id, username, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Group into conversations: unique (listing_id, other_user_id) pairs
  const conversationMap = new Map();

  for (const msg of messages) {
    const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
    const key = `${msg.listing_id}:${otherUser.id}`;

    if (!conversationMap.has(key)) {
      const unreadCount = messages.filter(
        (m) =>
          m.listing_id === msg.listing_id &&
          ((m.sender_id === otherUser.id && m.receiver_id === userId) ) &&
          !m.is_read
      ).length;

      conversationMap.set(key, {
        listing_id: msg.listing_id,
        listing: msg.listing,
        other_user: otherUser,
        last_message: msg,
        unread_count: unreadCount,
      });
    }
  }

  return res.json({ conversations: Array.from(conversationMap.values()) });
});

/**
 * GET /messages/:listingId/:otherUserId
 * Returns all messages in a specific conversation
 */
router.get("/:listingId/:otherUserId", requireAuth, async (req, res) => {
  const { listingId, otherUserId } = req.params;
  const userId = req.user.id;

  // Verify both users belong to the same college
  const { data: listing } = await supabase
    .from("listings")
    .select("college_id")
    .eq("id", listingId)
    .single();

  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:users!sender_id(id, username, avatar_url)
    `)
    .eq("listing_id", listingId)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Mark messages from other user as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("listing_id", listingId)
    .eq("sender_id", otherUserId)
    .eq("receiver_id", userId)
    .eq("is_read", false);

  return res.json({ messages });
});

/**
 * POST /messages
 * Sends a message
 */
router.post("/", requireAuth, async (req, res) => {
  const { listing_id, receiver_id, content } = req.body;
  const senderId = req.user.id;

  if (!listing_id || !receiver_id || !content?.trim()) {
    return res.status(400).json({ error: "listing_id, receiver_id, and content are required" });
  }

  if (senderId === receiver_id) {
    return res.status(400).json({ error: "Cannot message yourself" });
  }

  // Verify the listing exists and is accessible
  const { data: listing } = await supabase
    .from("listings")
    .select("id, college_id, status, title, slug")
    .eq("id", listing_id)
    .single();

  if (!listing) return res.status(404).json({ error: "Listing not found" });

  // Both users must be in the same college
  const senderCollegeId = req.userProfile.college_id;
  if (listing.college_id !== senderCollegeId) {
    return res.status(403).json({ error: "Cannot message across colleges" });
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      listing_id,
      sender_id: senderId,
      receiver_id,
      content: content.trim(),
      is_read: false,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Fire-and-forget: notify receiver by email
  // Only send if this is the first message in the conversation (avoid spam)
  supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listing_id)
    .eq("sender_id", senderId)
    .eq("receiver_id", receiver_id)
    .then(async ({ count }) => {
      if (count !== 1) return; // not first message — skip
      const { data: receiver } = await supabase
        .from("users")
        .select("email, first_name")
        .eq("id", receiver_id)
        .single();
      if (!receiver) return;
      sendNewMessageEmail({
        toEmail: receiver.email,
        toName: receiver.first_name,
        fromUsername: req.userProfile.username,
        listingTitle: listing.title || "a listing",
        listingSlug: listing.slug,
        messagePreview: content.trim().slice(0, 120),
      });
    })
    .catch(() => {});

  return res.status(201).json({ message });
});

/**
 * DELETE /messages/:listingId/:otherUserId
 * Deletes all messages in a conversation for the authenticated user
 */
router.delete("/:listingId/:otherUserId", requireAuth, async (req, res) => {
  const { listingId, otherUserId } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("listing_id", listingId)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    );

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true });
});

/**
 * GET /messages/unread-count
 * Returns total unread message count for the authenticated user
 */
router.get("/unread-count", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ count: count || 0 });
});

module.exports = router;
