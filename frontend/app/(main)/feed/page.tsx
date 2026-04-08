"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing, Category } from "@/types";

const CATEGORIES: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "textbooks", label: "Textbooks" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothes", label: "Clothes" },
  { value: "other", label: "Other" },
];

const PAGE_SIZE = 20;

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = (searchParams.get("category") ?? "all") as "all" | Category;
  const searchParam = searchParams.get("q") ?? "";

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(searchParam);
  const [searchInput, setSearchInput] = useState(searchParam);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/feed?${params.toString()}`);
  }

  const fetchListings = useCallback(async (pageNum: number, replace: boolean) => {
    const token = await getAuthToken();
    if (!token) return;

    const params = new URLSearchParams({ page: String(pageNum), limit: String(PAGE_SIZE) });
    if (categoryParam !== "all") params.set("category", categoryParam);
    if (search) params.set("search", search);

    try {
      const data = await apiRequest<{ listings: Listing[]; total: number }>(
        `/listings?${params.toString()}`,
        { token }
      );
      setListings((prev) => replace ? data.listings : [...prev, ...data.listings]);
      setTotal(data.total);
    } catch {
      // token may be expired — middleware will redirect
    }
  }, [categoryParam, search]);

  // Reload when filters change
  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchListings(1, true).finally(() => setLoading(false));
  }, [fetchListings]);

  async function loadMore() {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    await fetchListings(next, false);
    setLoadingMore(false);
  }

  function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setParam("q", searchInput.trim());
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (value === "") {
      setSearch("");
      setParam("q", "");
    }
  }

  const hasMore = listings.length < total;

  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="search"
          placeholder="Search listings..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(""); setSearch(""); setParam("q", ""); }}
            className="absolute inset-y-0 right-3 flex items-center text-[#9CA3AF] hover:text-[#6B7280]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setParam("category", cat.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoryParam === cat.value
                ? "bg-[#00599B] text-white"
                : "bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#00599B] hover:text-[#00599B]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-[#6B7280]">
          {total === 0
            ? "No listings found"
            : `${total} listing${total !== 1 ? "s" : ""}${search ? ` for "${search}"` : ""}`}
        </p>
      )}

      {/* Grid */}
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
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-[#374151] font-semibold mb-1">
            {search ? "No results found" : "No listings yet"}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            {search
              ? "Try a different search term or browse all categories"
              : "Be the first to post something!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:border-[#00599B] hover:text-[#00599B] transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <FeedContent />
    </Suspense>
  );
}
