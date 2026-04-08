"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import type { Message, User, Listing } from "@/types";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { listingId, otherUserId } = useParams<{ listingId: string; otherUserId: string }>();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;

      const [meData, threadData] = await Promise.all([
        apiRequest<{ user: User }>("/auth/me", { token }),
        apiRequest<{ messages: Message[] }>(`/messages/${listingId}/${otherUserId}`, { token }),
      ]);

      setMe(meData.user);
      setMessages(threadData.messages);

      if (threadData.messages.length > 0) {
        const first = threadData.messages[0];
        const other = first.sender_id === meData.user.id ? first.receiver : first.sender;
        if (other) setOtherUser(other as User);
      }

      // Load listing info via conversations (listing is embedded there)
      try {
        const convData = await apiRequest<{ conversations: { listing_id: string; listing: Listing; other_user: User }[] }>(
          "/messages", { token }
        );
        const conv = convData.conversations.find(
          (c) => c.listing_id === listingId && c.other_user.id === otherUserId
        );
        if (conv?.listing) setListing(conv.listing);
        if (conv?.other_user) setOtherUser(conv.other_user as User);
      } catch {}

      setLoading(false);
    }
    load();
  }, [listingId, otherUserId]);

  // Scroll to bottom after initial load
  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    if (!me) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${listingId}:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          const isRelevant =
            (msg.sender_id === me.id && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === me.id);
          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => scrollToBottom(true), 50);

          // Mark as read if we're the receiver
          if (msg.receiver_id === me.id) {
            getAuthToken().then((token) => {
              if (!token) return;
              apiRequest(`/messages/${listingId}/${otherUserId}`, { token }).catch(() => {});
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [me, listingId, otherUserId, scrollToBottom]);

  async function handleSend() {
    const content = input.trim();
    if (!content || sending || !me) return;

    setSending(true);
    setInput("");

    const token = await getAuthToken();
    try {
      await apiRequest("/messages", {
        method: "POST",
        token,
        body: { listing_id: listingId, receiver_id: otherUserId, content },
      });
      // Realtime will add the message — no need to manually push
    } catch {
      setInput(content); // restore on error
    }
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const day = formatDay(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) {
      last.msgs.push(msg);
    } else {
      grouped.push({ day, msgs: [msg] });
    }
  }

  const listingPhoto = listing?.listing_photos?.sort((a, b) => a.order_index - b.order_index)[0];

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-3.5rem-3rem)]">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
        <button
          onClick={() => router.back()}
          style={{ minHeight: 0 }}
          className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Other user avatar */}
        <div className="w-9 h-9 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0">
          {otherUser?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#00599B]">
              {otherUser?.first_name?.[0] ?? "?"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">
            {loading ? "Loading..." : `@${otherUser?.username ?? "unknown"}`}
          </p>
          {listing && (
            <Link
              href={`/listings/${listing.slug}`}
              className="text-xs text-[#6B7280] hover:text-[#00599B] truncate block transition-colors"
            >
              Re: {listing.title}
            </Link>
          )}
        </div>

        {/* Listing thumbnail */}
        {listing && (
          <Link href={`/listings/${listing.slug}`} style={{ minHeight: 0 }}>
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] overflow-hidden flex-shrink-0">
              {listingPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listingPhoto.storage_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#00599B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div>
              <p className="text-sm font-semibold text-[#374151] mb-1">No messages yet</p>
              <p className="text-xs text-[#9CA3AF]">Send a message to start the conversation.</p>
            </div>
          </div>
        ) : (
          grouped.map(({ day, msgs }) => (
            <div key={day}>
              {/* Day divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-[#F3F4F6]" />
                <span className="text-xs text-[#9CA3AF] font-medium">{day}</span>
                <div className="flex-1 h-px bg-[#F3F4F6]" />
              </div>

              {msgs.map((msg, i) => {
                const isMine = msg.sender_id === me?.id;
                const isLast = i === msgs.length - 1;
                const nextMsg = msgs[i + 1];
                const showAvatar = !isMine && (!nextMsg || nextMsg.sender_id !== msg.sender_id);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 mb-0.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar placeholder to keep alignment */}
                    {!isMine && (
                      <div className="w-6 h-6 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-6 h-6 rounded-full bg-[#E6F0F9] overflow-hidden flex items-center justify-center">
                            {otherUser?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-bold text-[#00599B]">
                                {otherUser?.first_name?.[0] ?? "?"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isMine
                            ? "bg-[#00599B] text-white rounded-br-sm"
                            : "bg-white border border-[#E5E7EB] text-[#111827] rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {isLast && (
                        <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {formatTime(msg.created_at)}
                          </span>
                          {isMine && (
                            <span title={msg.is_read ? "Seen" : "Sent"}>
                              {msg.is_read ? (
                                // Double tick — seen (blue)
                                <svg className="w-4 h-4 text-[#00599B]" viewBox="0 0 16 10" fill="none">
                                  <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                // Single tick — sent (gray)
                                <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 16 10" fill="none">
                                  <path d="M3 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-3 border-t border-[#E5E7EB]">
        <div className="flex items-end gap-2 bg-white border border-[#E5E7EB] rounded-2xl px-3 py-2 focus-within:border-[#00599B] focus-within:ring-2 focus-within:ring-[#00599B]/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="flex-1 resize-none text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none bg-transparent max-h-32 overflow-y-auto"
            style={{ minHeight: "1.25rem" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{ minHeight: 0 }}
            className="w-8 h-8 bg-[#00599B] rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#004d87] transition-colors flex-shrink-0"
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#9CA3AF] text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
