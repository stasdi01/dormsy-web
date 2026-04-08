"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/callback` }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E8F7F2] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Check your inbox</h2>
        <p className="text-sm text-[#6B7280] mb-6">
          We sent a password reset link to{" "}
          <span className="font-medium text-[#111827]">{email}</span>.
          Check your college email.
        </p>
        <Link href="/login">
          <Button variant="secondary" fullWidth>
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">
          Forgot your password?
        </h1>
        <p className="text-sm text-[#6B7280]">
          Enter your college email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="College email"
          type="email"
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          error={error}
          autoComplete="email"
          inputMode="email"
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Remember your password?{" "}
        <Link href="/login" className="text-[#00599B] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
