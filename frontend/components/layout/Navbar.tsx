"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import type { User } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;
      try {
        const data = await apiRequest<{ user: User }>("/auth/me", { token });
        setUser(data.user);
      } catch {}
      try {
        const data = await apiRequest<{ count: number }>("/messages/unread-count", { token });
        setUnread(data.count ?? 0);
      } catch {}
    }
    load();
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/feed" className="inline-flex items-center gap-0.5 min-h-0">
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">Dorm</span>
          <span className="text-xl font-bold tracking-tight text-[#5F9DD0]">Sy</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Messages */}
          <Link
            href="/messages"
            className="relative p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Messages"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#00599B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          {/* Sell button */}
          <Link
            href="/listings/new"
            className="hidden sm:flex items-center gap-1.5 bg-[#00599B] hover:bg-[#004d87] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Sell
          </Link>

          {/* Avatar menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-[#E6F0F9] flex items-center justify-center text-[#00599B] text-xs font-bold hover:ring-2 hover:ring-[#00599B]/30 transition-all overflow-hidden"
              aria-label="Account menu"
            >
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                initials || (
                  <svg className="w-4 h-4 text-[#00599B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg py-1 z-50">
                {user && (
                  <div className="px-4 py-2.5 border-b border-[#F3F4F6]">
                    <p className="text-sm font-semibold text-[#111827] truncate">@{user.username}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
                  </div>
                )}
                <Link
                  href="/feed"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Browse
                </Link>
                <Link
                  href="/my-listings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  My listings
                </Link>
                <Link
                  href="/saved"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Saved items
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Settings
                </Link>
                <div className="border-t border-[#F3F4F6] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
