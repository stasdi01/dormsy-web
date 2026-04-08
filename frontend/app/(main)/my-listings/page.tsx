"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { Button } from "@/components/ui/Button";
import type { Listing } from "@/types";

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

const CONDITION_LABEL: Record<string, string> = {
  new: "New", like_new: "Like New", good: "Good", used: "Used",
};

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function MyListingsPage() {
  const [tab, setTab] = useState<"active" | "sold" | "archived">("active");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const token = await getAuthToken();
    if (!token) return;
    try {
      const data = await apiRequest<{ listings: Listing[] }>(`/listings/my?status=${tab}`, { token });
      setListings(data.listings);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function markStatus(id: string, status: string) {
    setActionLoading(id + status);
    const token = await getAuthToken();
    try {
      await apiRequest(`/listings/${id}/status`, { method: "PATCH", token, body: { status } });
      await load();
    } catch {}
    setActionLoading(null);
  }

  async function extendListing(id: string) {
    setActionLoading(id + "extend");
    const token = await getAuthToken();
    try {
      await apiRequest(`/listings/${id}/extend`, { method: "PATCH", token });
      await load();
    } catch {}
    setActionLoading(null);
  }

  async function deleteListing(id: string) {
    setActionLoading(id + "delete");
    const token = await getAuthToken();
    try {
      await apiRequest(`/listings/${id}`, { method: "DELETE", token });
      setConfirmDelete(null);
      await load();
    } catch {}
    setActionLoading(null);
  }

  const filtered = listings.filter((l) => l.status === tab);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">My listings</h1>
        <Link href="/listings/new">
          <Button size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New listing
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value as typeof tab)}
            style={{ minHeight: 0 }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.value
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 bg-[#F3F4F6] rounded-xl flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="h-3.5 bg-[#F3F4F6] rounded w-2/3" />
                <div className="h-3 bg-[#F3F4F6] rounded w-1/3" />
                <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-[#374151] font-semibold mb-1">No {tab} listings</p>
          {tab === "active" && (
            <p className="text-sm text-[#9CA3AF]">Post something to get started.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((listing) => {
            const photo = listing.listing_photos?.sort((a, b) => a.order_index - b.order_index)[0];
            const daysLeft = daysUntil(listing.expires_at);
            const expiringSoon = daysLeft <= 7 && tab === "active";

            return (
              <div
                key={listing.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex gap-4"
              >
                {/* Photo */}
                <Link href={`/listings/${listing.slug}`} style={{ minHeight: 0 }}>
                  <div className="w-20 h-20 rounded-xl bg-[#F3F4F6] overflow-hidden flex-shrink-0">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.storage_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/listings/${listing.slug}`}>
                    <p className="text-sm font-semibold text-[#111827] truncate hover:text-[#00599B] transition-colors">
                      {listing.title}
                    </p>
                  </Link>
                  <p className="text-sm font-bold text-[#00599B] mt-0.5">{formatPrice(listing.price)}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{CONDITION_LABEL[listing.condition]}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#9CA3AF]">
                    <span>{listing.views_count} views</span>
                    {tab === "active" && (
                      <span className={expiringSoon ? "text-orange-500 font-medium" : ""}>
                        {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tab === "active" && (
                      <>
                        <Link href={`/listings/${listing.slug}/edit`}>
                          <button
                            style={{ minHeight: 0 }}
                            className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#00599B] hover:text-[#00599B] transition-colors"
                          >
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => markStatus(listing.id, "sold")}
                          disabled={actionLoading === listing.id + "sold"}
                          style={{ minHeight: 0 }}
                          className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#1D9E75] hover:text-[#1D9E75] transition-colors disabled:opacity-50"
                        >
                          {actionLoading === listing.id + "sold" ? "..." : "Mark sold"}
                        </button>
                        <button
                          onClick={() => markStatus(listing.id, "archived")}
                          disabled={actionLoading === listing.id + "archived"}
                          style={{ minHeight: 0 }}
                          className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#6B7280] hover:text-[#6B7280] transition-colors disabled:opacity-50"
                        >
                          {actionLoading === listing.id + "archived" ? "..." : "Archive"}
                        </button>
                        {expiringSoon && (
                          <button
                            onClick={() => extendListing(listing.id)}
                            disabled={actionLoading === listing.id + "extend"}
                            style={{ minHeight: 0 }}
                            className="px-3 py-1.5 text-xs font-medium border border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === listing.id + "extend" ? "..." : "Extend 30d"}
                          </button>
                        )}
                      </>
                    )}

                    {tab === "sold" && (
                      <button
                        onClick={() => markStatus(listing.id, "active")}
                        disabled={actionLoading === listing.id + "active"}
                        style={{ minHeight: 0 }}
                        className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#00599B] hover:text-[#00599B] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === listing.id + "active" ? "..." : "Relist"}
                      </button>
                    )}

                    {tab === "archived" && (
                      <button
                        onClick={() => markStatus(listing.id, "active")}
                        disabled={actionLoading === listing.id + "active"}
                        style={{ minHeight: 0 }}
                        className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#00599B] hover:text-[#00599B] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === listing.id + "active" ? "..." : "Relist"}
                      </button>
                    )}

                    {/* Delete — always available */}
                    <button
                      onClick={() => setConfirmDelete(listing.id)}
                      style={{ minHeight: 0 }}
                      className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[#111827] mb-2">Delete listing?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              This can&apos;t be undone. The listing will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={actionLoading === confirmDelete + "delete"}
                onClick={() => deleteListing(confirmDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
