"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { Button } from "@/components/ui/Button";
import type { Listing, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  used: "Used",
};

const CATEGORY_LABEL: Record<string, string> = {
  textbooks: "Textbooks",
  electronics: "Electronics",
  furniture: "Furniture",
  clothes: "Clothes",
  other: "Other",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();

      // Load listing (token optional — view count only increments when authed)
      try {
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/listings/${slug}`, { headers });
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const data = await res.json();
        setListing(data.listing);
      } catch {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!token) { setLoading(false); return; }

      // Load current user
      try {
        const data = await apiRequest<{ user: User }>("/auth/me", { token });
        setMe(data.user);
      } catch {}

      setLoading(false);
    }
    load();
  }, [slug]);

  // Check saved state after both listing and me are loaded
  useEffect(() => {
    if (!listing || !me) return;
    async function checkSaved() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const data = await apiRequest<{ saved: boolean }>(`/saved/check/${listing!.id}`, { token });
        setSaved(data.saved);
      } catch {}
    }
    checkSaved();
  }, [listing, me]);

  async function toggleSave() {
    if (!me || !listing) return;
    setSavingToggle(true);
    try {
      const token = await getAuthToken();
      const data = await apiRequest<{ saved: boolean }>(`/saved/${listing.id}`, {
        method: "POST",
        token,
      });
      setSaved(data.saved);
    } catch {}
    setSavingToggle(false);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !listing || !me) return;
    setSendingMessage(true);
    setMessageError("");
    try {
      const token = await getAuthToken();
      await apiRequest("/messages", {
        method: "POST",
        token,
        body: {
          listing_id: listing.id,
          receiver_id: listing.user_id,
          content: messageText.trim(),
        },
      });
      setMessageSent(true);
      setMessageText("");
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "Failed to send message");
    }
    setSendingMessage(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-[#F3F4F6] rounded-2xl" />
          <div className="flex flex-col gap-4 pt-2">
            <div className="h-5 bg-[#F3F4F6] rounded w-1/3" />
            <div className="h-8 bg-[#F3F4F6] rounded w-2/3" />
            <div className="h-10 bg-[#F3F4F6] rounded w-1/4" />
            <div className="h-20 bg-[#F3F4F6] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-[#111827] mb-2">Listing not found</p>
        <p className="text-sm text-[#9CA3AF] mb-6">It may have been removed or sold.</p>
        <Link href="/feed"><Button variant="secondary">Back to feed</Button></Link>
      </div>
    );
  }

  const photos = (listing.listing_photos ?? []).sort((a, b) => a.order_index - b.order_index);
  const isMine = me?.id === listing.user_id;
  const isSold = listing.status === "sold";
  const isArchived = listing.status === "archived";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-5 transition-colors"
        style={{ minHeight: 0 }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Photos */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden relative">
            {photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photos[photoIndex].storage_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}

            {(isSold || isArchived) && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                <span className="bg-white text-[#111827] font-bold text-lg px-6 py-2 rounded-full">
                  {isSold ? "Sold" : "Archived"}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setPhotoIndex(i)}
                  style={{ minHeight: 0 }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                    i === photoIndex ? "border-[#00599B]" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.storage_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {/* Category + condition */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#F3F4F6] text-[#374151] text-xs font-medium px-2.5 py-1 rounded-full">
              {CATEGORY_LABEL[listing.category] ?? listing.category}
            </span>
            <span className="bg-[#F3F4F6] text-[#374151] text-xs font-medium px-2.5 py-1 rounded-full">
              {CONDITION_LABEL[listing.condition] ?? listing.condition}
            </span>
          </div>

          {/* Title + price */}
          <div>
            <h1 className="text-2xl font-bold text-[#111827] leading-snug">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-bold text-[#00599B]">{formatPrice(listing.price)}</p>
              {listing.is_negotiable && (
                <span className="text-xs font-medium bg-[#E6F0F9] text-[#00599B] px-2 py-0.5 rounded-full">Negotiable</span>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-3">
            <span>{timeAgo(listing.created_at)}</span>
            <span>{listing.views_count} view{listing.views_count !== 1 ? "s" : ""}</span>
            {listing.saves_count !== undefined && (
              <span>{listing.saves_count} save{listing.saves_count !== 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Seller */}
          {listing.seller && (
            <Link
              href={`/profile/${listing.seller.username}`}
              className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-[#00599B]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0">
                {listing.seller.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.seller.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#00599B]">
                    {listing.seller.first_name?.[0] ?? "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">@{listing.seller.username}</p>
                <p className="text-xs text-[#9CA3AF]">
                  Member since {new Date(listing.seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
              <svg className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          )}

          {/* Actions */}
          {isMine ? (
            <div className="flex gap-2">
              <Link href={`/listings/${listing.slug}/edit`} className="flex-1">
                <Button variant="secondary" fullWidth>Edit listing</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Message form */}
              {!isSold && !isArchived && (
                messageSent ? (
                  <div className="bg-[#E8F7F2] border border-[#1D9E75]/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm font-medium text-[#1D9E75]">Message sent!</p>
                    <button
                      onClick={() => setMessageSent(false)}
                      className="text-xs text-[#1D9E75] hover:underline mt-1"
                      style={{ minHeight: 0 }}
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    <textarea
                      placeholder={`Hi, is this still available?`}
                      value={messageText}
                      onChange={(e) => { setMessageText(e.target.value); setMessageError(""); }}
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors resize-none"
                    />
                    {messageError && <p className="text-xs text-red-500">{messageError}</p>}
                    <Button type="submit" fullWidth loading={sendingMessage} disabled={!messageText.trim()}>
                      Send message
                    </Button>
                  </form>
                )
              )}

              {/* Save button */}
              <button
                onClick={toggleSave}
                disabled={savingToggle}
                style={{ minHeight: 0 }}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  saved
                    ? "bg-[#FFF7ED] border-[#F59E0B] text-[#D97706]"
                    : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#00599B] hover:text-[#00599B]"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={saved ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                {saved ? "Saved" : "Save listing"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
