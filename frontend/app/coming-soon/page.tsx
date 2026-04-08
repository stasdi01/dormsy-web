"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [form, setForm] = useState({ email: prefillEmail, college_name: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.college_name.trim()) {
      setError("Both fields are required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/colleges/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, college_name: form.college_name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-[#E6F0F9] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#00599B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>

          {submitted ? (
            <>
              <h1 className="text-xl font-bold text-[#111827] mb-2">You&apos;re on the list!</h1>
              <p className="text-sm text-[#6B7280] mb-6">
                We&apos;ll email you the moment DormSy launches at your school.
              </p>
              <Link href="/">
                <Button variant="secondary" fullWidth>Back to home</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111827] mb-2">
                DormSy isn&apos;t at your college yet
              </h1>
              <p className="text-sm text-[#6B7280] mb-6">
                We&apos;re growing fast. Enter your details and we&apos;ll let you know when we launch at your school.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 text-left">
                <Input
                  label="Your email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  inputMode="email"
                />
                <Input
                  label="Your college name"
                  placeholder="e.g. Cornell University"
                  value={form.college_name}
                  onChange={(e) => setForm((f) => ({ ...f, college_name: e.target.value }))}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button type="submit" fullWidth loading={loading}>
                  Join the waitlist
                </Button>
              </form>

              <Link href="/" className="block mt-4 text-xs text-[#9CA3AF] hover:text-[#6B7280]">
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense>
      <ComingSoonContent />
    </Suspense>
  );
}
