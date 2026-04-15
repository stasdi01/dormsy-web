"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiRequest, getAuthToken } from "@/lib/utils/api";

const CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "general", label: "General Feedback" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState<Category>("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Please select a star rating."); return; }
    if (message.trim().length < 5) { setError("Please enter a message."); return; }

    setLoading(true);
    setError("");
    try {
      const token = await getAuthToken();
      await apiRequest("/feedback", {
        method: "POST",
        token,
        body: { rating, category, message },
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-[#E6F4EE] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Thanks for your feedback!</h1>
        <p className="text-sm text-[#6B7280] mb-8">
          Your input helps us make DormSy better for everyone on campus.
        </p>
        <Button onClick={() => router.push("/feed")}>Back to feed</Button>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors mb-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#111827]">Share feedback</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Tell us what&apos;s working, what&apos;s not, or what you&apos;d love to see next.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star rating */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#111827] mb-4">How would you rate your experience?</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              >
                <svg
                  className={`w-10 h-10 transition-colors ${
                    star <= displayRating ? "text-[#F59E0B]" : "text-[#E5E7EB]"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <p className="text-center text-xs text-[#9CA3AF] mt-3">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][displayRating]}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <p className="text-sm font-semibold text-[#111827] mb-3">What type of feedback is this?</p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  category === value
                    ? "bg-[#00599B] text-white border-[#00599B]"
                    : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#00599B] hover:text-[#00599B]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
          <label htmlFor="message" className="block text-sm font-semibold text-[#111827] mb-3">
            Tell us more
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you experienced, what you'd like to see, or anything on your mind…"
            rows={5}
            className="w-full px-3.5 py-3 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] resize-none"
          />
          <p className="text-xs text-[#9CA3AF] mt-1.5 text-right">{message.length} / 1000</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={!rating || message.trim().length < 5}>
          Submit feedback
        </Button>
      </form>
    </div>
  );
}
