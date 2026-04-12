"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!subject.trim()) e.subject = "Required";
    if (!message.trim()) e.message = "Required";
    else if (message.trim().length < 10) e.message = "Please provide more detail";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again or email us at support@dormsy.com." });
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
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#E8F7F2] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] mb-3">Message sent!</h1>
            <p className="text-[#6B7280] mb-8">
              Thanks for reaching out. We&apos;ll get back to you at{" "}
              <span className="font-semibold text-[#111827]">{email}</span> as soon as possible.
            </p>
            <Link href="/" className="text-sm text-[#00599B] font-medium hover:underline">
              ← Back to home
            </Link>
          </div>
        ) : (
          <div className="max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#111827] mb-2">Contact support</h1>
              <p className="text-[#6B7280]">
                Have a question or issue? Fill out the form and we&apos;ll get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Your name"
                  placeholder="Alex"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                  error={errors.name}
                />
                <Input
                  label="Your email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  error={errors.email}
                  inputMode="email"
                />
              </div>

              <Input
                label="Subject"
                placeholder="e.g. Issue with my listing"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setErrors((p) => ({ ...p, subject: "" })); }}
                error={errors.subject}
              />

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Message</label>
                <textarea
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
                  rows={5}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors resize-none ${errors.message ? "border-red-400" : "border-[#E5E7EB]"}`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>

              {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

              <Button type="submit" fullWidth loading={loading}>
                Send message
              </Button>
            </form>

            <p className="text-center text-xs text-[#9CA3AF] mt-6">
              Or email us directly at{" "}
              <a href="mailto:support@dormsy.com" className="text-[#00599B] font-medium hover:underline">
                support@dormsy.com
              </a>
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-[#F3F4F6] py-6 px-4 text-center text-xs text-[#9CA3AF]">
        <p>© {new Date().getFullYear()} DormSy. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/" className="hover:text-[#00599B] transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-[#00599B] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#00599B] transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
