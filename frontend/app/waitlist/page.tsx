"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required"); return; }
    if (!email.toLowerCase().endsWith(".edu")) {
      setError("Please use your .edu college email");
      return;
    }
    if (!college.trim()) { setError("College name is required"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), college_name: college.trim() }),
      });
      const data = await res.json();

      if (data.status === "supported") {
        // Their college is already supported — send them to sign up
        window.location.href = `/sign-up?email=${encodeURIComponent(email.trim())}`;
        return;
      }

      // unsupported — saved to waitlist
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-[#F3F4F6] px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/colored-logo.svg" alt="DormSy" width={28} height={28} className="rounded-md" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#0F172A]">Dorm</span><span className="text-[#5F9DD0]">Sy</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {submitted ? (
          /* ── Success state ── */
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#E8F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mb-3">You&apos;re on the list!</h1>
            <p className="text-[#6B7280] mb-2">
              We&apos;ve added <span className="font-semibold text-[#111827]">{email}</span> to the waitlist for{" "}
              <span className="font-semibold text-[#111827]">{college}</span>.
            </p>
            <p className="text-[#6B7280] mb-8">
              We&apos;ll email you as soon as DormSy launches at your school.
            </p>
            <Link
              href="/"
              className="text-sm text-[#00599B] font-medium hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <span className="inline-block bg-[#E8F7F2] text-[#1D9E75] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Coming to your campus
              </span>
              <h1 className="text-3xl font-bold text-[#111827] mb-3">Request DormSy at your college</h1>
              <p className="text-[#6B7280]">
                DormSy isn&apos;t at your school yet — but it&apos;s coming. Drop your info and we&apos;ll launch there next.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                label="College email (.edu)"
                type="email"
                placeholder="you@yourcollege.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                autoComplete="email"
                inputMode="email"
              />
              <Input
                label="College name"
                placeholder="e.g. Grinnell College"
                value={college}
                onChange={(e) => { setCollege(e.target.value); setError(""); }}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" loading={loading} fullWidth>
                Request my college
              </Button>
            </form>

            <p className="text-center text-xs text-[#9CA3AF] mt-6">
              Already have access?{" "}
              <Link href="/sign-up" className="text-[#00599B] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
