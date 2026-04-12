"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import type { Listing } from "@/types";

const CONDITION_STYLE: Record<string, { label: string; className: string }> = {
  new:      { label: "New",      className: "bg-[#E8F7F2] text-[#1D9E75]" },
  like_new: { label: "Like New", className: "bg-[#E6F0F9] text-[#00599B]" },
  good:     { label: "Good",     className: "bg-[#FEF9E7] text-[#D97706]" },
  used:     { label: "Used",     className: "bg-[#F3F4F6] text-[#6B7280]" },
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

type Props = {
  listing: Listing;
  initialSaved?: boolean;
};

export function ListingCard({ listing, initialSaved = false }: Props) {
  const photo = listing.listing_photos
    ?.sort((a, b) => a.order_index - b.order_index)[0];

  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const token = await getAuthToken();
      const data = await apiRequest<{ saved: boolean }>(`/saved/${listing.id}`, {
        method: "POST",
        token,
      });
      setSaved(data.saved);
    } catch {}
    setSaving(false);
  }

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col"
    >
      {/* Photo */}
      <div className="aspect-square bg-[#F3F4F6] relative overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.storage_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Category pill */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#374151] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#E5E7EB]">
          {CATEGORY_LABEL[listing.category] ?? listing.category}
        </span>

        {/* Save / heart button */}
        <button
          onClick={handleSave}
          style={{ minHeight: 0 }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-[#E5E7EB] hover:scale-110 transition-all shadow-sm"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <svg
            className={`w-3.5 h-3.5 transition-colors ${saved ? "text-red-500 fill-red-500" : "text-[#9CA3AF] fill-none"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[#111827] font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {listing.title}
          </p>
          <p className="text-[#00599B] font-bold text-sm whitespace-nowrap">
            {formatPrice(listing.price)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CONDITION_STYLE[listing.condition]?.className ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
              {CONDITION_STYLE[listing.condition]?.label ?? listing.condition}
            </span>
            {listing.is_negotiable && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F5F0FF] text-[#7C3AED]">
                OBO
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#9CA3AF]">
            {timeAgo(listing.created_at)}
          </span>
        </div>

        {listing.seller && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-[#F3F4F6] mt-1">
            <div className="w-4 h-4 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0">
              {listing.seller.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.seller.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] text-[#00599B] font-bold">
                  {listing.seller.first_name?.[0] ?? "?"}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#6B7280] truncate">@{listing.seller.username}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
