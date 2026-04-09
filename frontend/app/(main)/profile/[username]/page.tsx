"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing, User } from "@/types";

type ProfileData = {
  user: User & { college: { name: string } };
  stats: { total_listings: number; total_sold: number };
  listings: Listing[];
};

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const [profileData, meData] = await Promise.all([
          apiRequest<ProfileData>(`/users/${username}`, { token }),
          apiRequest<{ user: User }>("/auth/me", { token }),
        ]);
        setData(profileData);
        setMe(meData.user);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F3F4F6]" />
          <div className="flex flex-col gap-2">
            <div className="h-5 bg-[#F3F4F6] rounded w-32" />
            <div className="h-3 bg-[#F3F4F6] rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
              <div className="aspect-square bg-[#F3F4F6]" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
                <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-[#111827] mb-2">User not found</p>
        <p className="text-sm text-[#9CA3AF] mb-6">This profile doesn&apos;t exist or isn&apos;t at your college.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#00599B] hover:underline"
          style={{ minHeight: 0 }}
        >
          Go back
        </button>
      </div>
    );
  }

  const { user, stats, listings } = data;
  const isMe = me?.id === user.id;
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
        style={{ minHeight: 0 }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      {/* Profile header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#00599B]">
                {user.first_name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#111827]">@{user.username}</h1>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
              <span className="text-sm text-[#1D9E75] font-medium">{user.college?.name}</span>
            </div>

            <p className="text-xs text-[#9CA3AF] mt-1">Member since {joinDate}</p>

            {/* Contact links */}
            <div className="flex items-center gap-3 mt-3">
              {user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center gap-1.5 text-xs text-[#374151] hover:text-[#00599B] transition-colors"
                  style={{ minHeight: 0 }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {user.phone}
                </a>
              )}
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#374151] hover:text-[#00599B] transition-colors"
                  style={{ minHeight: 0 }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @{user.instagram}
                </a>
              )}
            </div>
          </div>

          {/* Action */}
          {isMe ? (
            <Link href="/settings">
              <button
                style={{ minHeight: 0 }}
                className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#374151] hover:border-[#00599B] hover:text-[#00599B] transition-colors"
              >
                Edit profile
              </button>
            </Link>
          ) : (
            <Link href={`/messages`}>
              <button
                style={{ minHeight: 0 }}
                className="px-3 py-1.5 text-xs font-medium bg-[#00599B] text-white rounded-lg hover:bg-[#004d87] transition-colors"
              >
                Message
              </button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-5 pt-5 border-t border-[#F3F4F6]">
          <div className="text-center">
            <p className="text-xl font-bold text-[#111827]">{stats.total_listings}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Listed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#111827]">{stats.total_sold}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Sold</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#111827]">{listings.length}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Active now</p>
          </div>
        </div>
      </div>

      {/* Active listings */}
      <h2 className="text-base font-semibold text-[#374151] mb-3">
        {isMe ? "Your active listings" : `${user.username}'s listings`}
      </h2>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-[#E5E7EB] rounded-2xl">
          <p className="text-sm font-semibold text-[#374151] mb-1">No active listings</p>
          {isMe ? (
            <Link href="/listings/new" className="text-sm text-[#00599B] hover:underline mt-1">
              Post your first listing
            </Link>
          ) : (
            <p className="text-xs text-[#9CA3AF]">Check back later.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
