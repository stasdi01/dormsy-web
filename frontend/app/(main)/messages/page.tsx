"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { Button } from "@/components/ui/Button";
import type { Conversation } from "@/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ listingId: string; otherUserId: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const data = await apiRequest<{ conversations: Conversation[] }>("/messages", { token });
        setConversations(data.conversations);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function handleDeleteConversation() {
    if (!confirmDelete) return;
    setDeleting(true);
    const token = await getAuthToken();
    try {
      await apiRequest(`/messages/${confirmDelete.listingId}/${confirmDelete.otherUserId}`, {
        method: "DELETE",
        token,
      });
      setConversations((prev) =>
        prev.filter(
          (c) => !(c.listing_id === confirmDelete.listingId && c.other_user.id === confirmDelete.otherUserId)
        )
      );
      setConfirmDelete(null);
    } catch {}
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-[#111827] mb-6">Messages</h1>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
                <div className="h-3 bg-[#F3F4F6] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-[#374151] font-semibold mb-1">No messages yet</p>
          <p className="text-sm text-[#9CA3AF]">Message a seller from any listing to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conv) => {
            const photo = conv.listing?.listing_photos
              ?.sort((a, b) => a.order_index - b.order_index)[0];

            return (
              <div key={`${conv.listing_id}:${conv.other_user.id}`} className="relative group">
                <Link
                  href={`/messages/${conv.listing_id}/${conv.other_user.id}`}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3 hover:border-[#00599B]/30 hover:shadow-sm transition-all pr-12"
                >
                  {/* Listing thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] overflow-hidden flex-shrink-0">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.storage_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#111827] truncate">
                        @{conv.other_user.username}
                      </p>
                      <span className="text-xs text-[#9CA3AF] flex-shrink-0">
                        {timeAgo(conv.last_message.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] truncate mb-0.5">
                      {conv.listing?.title}
                    </p>
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-semibold text-[#111827]" : "text-[#6B7280]"}`}>
                      {conv.last_message.content}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 bg-[#00599B] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread_count > 9 ? "9+" : conv.unread_count}
                    </span>
                  )}
                </Link>

                {/* Delete button */}
                <button
                  onClick={() => setConfirmDelete({ listingId: conv.listing_id, otherUserId: conv.other_user.id })}
                  style={{ minHeight: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Delete conversation?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              This will permanently delete all messages in this conversation. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteConversation}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
