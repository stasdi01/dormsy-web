"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend. Try again.");
      } else {
        setResent(true);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-[#E6F0F9] rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-[#00599B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[#111827] mb-2">
        Check your inbox
      </h1>
      <p className="text-sm text-[#6B7280] mb-1">
        We sent a verification link to
      </p>
      {email && (
        <p className="text-sm font-semibold text-[#111827] mb-5 break-all">
          {email}
        </p>
      )}

      {/* Steps */}
      <div className="text-left bg-[#F9FAFB] rounded-xl p-4 mb-6 space-y-3">
        {[
          { step: "1", text: "Open your college email inbox" },
          { step: "2", text: "Click the verification link in the email" },
          { step: "3", text: "You'll be signed in automatically" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00599B] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {step}
            </span>
            <span className="text-sm text-[#374151]">{text}</span>
          </div>
        ))}
      </div>

      {resent ? (
        <div className="flex items-center justify-center gap-2 text-sm text-[#1D9E75] mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Verification email resent!
        </div>
      ) : (
        <>
          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}
          <Button
            variant="secondary"
            fullWidth
            loading={loading}
            onClick={handleResend}
          >
            Resend verification email
          </Button>
        </>
      )}

      <p className="mt-5 text-xs text-[#9CA3AF]">
        Wrong email?{" "}
        <Link href="/sign-up" className="text-[#00599B] hover:underline">
          Go back and sign up again
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
