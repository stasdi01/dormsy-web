"use client";

import { useEffect, useState } from "react";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { SavedListing } from "@/types";

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const data = await apiRequest<{ saved: SavedListing[] }>("/saved", { token });
        setSaved(data.saved);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Saved items</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-[#F3F4F6]" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
                <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <p className="text-[#374151] font-semibold mb-1">No saved items yet</p>
          <p className="text-sm text-[#9CA3AF]">
            Tap the bookmark on any listing to save it for later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {saved.map((s) =>
            s.listing ? <ListingCard key={s.id} listing={s.listing} initialSaved={true} /> : null
          )}
        </div>
      )}
    </div>
  );
}
