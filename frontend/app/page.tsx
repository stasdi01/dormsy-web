import Link from "next/link";
import Image from "next/image";

const LIVE_COLLEGES = ["Luther College"];

const COMING_SOON_COLLEGES = ["Barry University", "Grinnell College"];

const CATEGORIES = [
  { icon: "📚", label: "Textbooks" },
  { icon: "💻", label: "Electronics" },
  { icon: "🛋️", label: "Furniture" },
  { icon: "👕", label: "Clothing" },
  { icon: "🍳", label: "Kitchen" },
  { icon: "🎸", label: "Hobbies" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign up with your .edu email",
    description:
      "Your college email verifies you're a real student. No strangers — only your campus community.",
  },
  {
    step: "02",
    title: "Browse or post a listing",
    description:
      "Search items from people at your school, or snap a photo and list something in under 2 minutes.",
  },
  {
    step: "03",
    title: "Message and meet nearby",
    description:
      "Chat directly with buyers and sellers. Pick up on campus — no shipping, no hassle.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#F3F4F6]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/colored-logo.svg"
              alt="DormSy"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-[#0F172A]">Dorm</span>
              <span className="text-[#5F9DD0]">Sy</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#374151] hover:text-[#00599B] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-[#00599B] text-white px-4 py-2 rounded-xl hover:bg-[#004d87] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto w-full px-4 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: text */}
        <div className="flex-1 flex flex-col items-start text-left">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="inline-flex items-center gap-2 bg-[#E6F0F9] text-[#00599B] text-xs font-semibold px-3.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-pulse" />
              Students only · Verified .edu emails
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#E8F7F2] text-[#1D9E75] text-xs font-semibold px-3.5 py-1.5 rounded-full">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              100% free — no fees, ever
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-xl mb-6 text-[#111827]">
            Buy &amp; sell within{" "}
            <span className="text-[#00599B]">your campus</span>
          </h1>

          <p className="text-lg text-[#6B7280] max-w-md mb-10 leading-relaxed">
            DormSy is a marketplace for college students — verified, local, and
            built for campus life. No strangers, no shipping, no fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-[#00599B] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#004d87] transition-colors text-base shadow-sm"
            >
              Start for free
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#374151] font-semibold px-7 py-3.5 rounded-xl hover:border-[#00599B] hover:text-[#00599B] transition-colors text-base"
            >
              I already have an account
            </Link>
          </div>

          {/* Currently live */}
          <div className="mt-10 flex items-center gap-2 text-[#6B7280] text-sm font-medium">
            <svg
              className="w-4 h-4 text-[#1D9E75]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            Currently live at{" "}
            {LIVE_COLLEGES.length === 1 ? (
              <span className="text-[#111827] font-bold ml-1">
                {LIVE_COLLEGES[0]}
              </span>
            ) : (
              <span className="text-[#111827] font-bold ml-1">
                {LIVE_COLLEGES.length} colleges
              </span>
            )}
          </div>
        </div>

        {/* Right: image */}
        <div className="flex-1 w-full lg:max-w-[520px]">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <Image
              src="/hero-bg.png"
              alt="Campus marketplace items"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Where we're live ── */}
      <section className="py-20 px-4 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-[#E8F7F2] text-[#1D9E75] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
              Availability
            </span>
            <h2 className="text-3xl font-bold text-[#111827] mb-3">
              Where DormSy is live
            </h2>
            <p className="text-[#6B7280] max-w-md mx-auto">
              We&apos;re expanding campus by campus. Don&apos;t see your school
              yet?{" "}
              <Link
                href="/waitlist"
                className="text-[#00599B] font-semibold hover:underline"
              >
                Join the waitlist
              </Link>{" "}
              and we&apos;ll launch at your college next.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Live colleges */}
            {LIVE_COLLEGES.map((name) => (
              <div
                key={name}
                className="flex items-center gap-3 bg-white border border-[#1D9E75]/30 rounded-2xl px-4 py-3.5 shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8F7F2] flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 bg-[#1D9E75] rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">
                    {name}
                  </p>
                  <p className="text-xs text-[#1D9E75] font-medium">Live now</p>
                </div>
                <svg
                  className="w-4 h-4 text-[#1D9E75] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            ))}

            {/* Coming soon colleges */}
            {COMING_SOON_COLLEGES.map((name) => (
              <div
                key={name}
                className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 opacity-60"
              >
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                  <span className="w-2.5 h-2.5 bg-[#D1D5DB] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#374151] truncate">
                    {name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Coming soon</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-8">
            More colleges launching soon.{" "}
            <Link
              href="/waitlist"
              className="text-[#00599B] hover:underline font-medium"
            >
              Request yours →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">
            Everything you need on campus
          </h2>
          <p className="text-[#6B7280] mb-12">
            From day-one essentials to semester-end furniture — find it all
            nearby.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] hover:border-[#00599B]/30 hover:bg-[#E6F0F9] transition-all cursor-default"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-medium text-[#374151]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">How DormSy works</h2>
            <p className="text-[#6B7280]">Three steps to your first deal.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00599B] text-white flex items-center justify-center font-bold text-sm">
                  {step}
                </div>
                <h3 className="text-base font-bold text-[#111827]">{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          <div className="bg-[#E6F0F9] rounded-3xl p-8">
            <div className="w-10 h-10 bg-[#00599B] rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Verified students only</h3>
            <p className="text-sm text-[#374151] leading-relaxed">
              Sign up with your .edu email. Every person you meet on DormSy is a
              verified student at your college.
            </p>
          </div>

          <div className="bg-[#E8F7F2] rounded-3xl p-8">
            <div className="w-10 h-10 bg-[#1D9E75] rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Direct messaging</h3>
            <p className="text-sm text-[#374151] leading-relaxed">
              Chat directly with buyers and sellers, right inside the app. No
              phone numbers needed until you're ready.
            </p>
          </div>

          <div className="bg-[#FEF9E7] rounded-3xl p-8">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Zero fees</h3>
            <p className="text-sm text-[#374151] leading-relaxed">
              DormSy is completely free. No listing fees, no transaction cuts,
              no subscriptions. Keep every dollar you earn.
            </p>
          </div>

          <div className="bg-[#F5F0FF] rounded-3xl p-8">
            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">List in 2 minutes</h3>
            <p className="text-sm text-[#374151] leading-relaxed">
              Snap photos, set a price, hit publish. Your listing goes live to
              your entire campus instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 bg-[#00599B] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Ready to start?</h2>
          <p className="text-[#B8D4EC] mb-10 text-lg">
            Join your campus marketplace today. It takes 30 seconds to sign up.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-[#00599B] font-bold px-8 py-4 rounded-xl hover:bg-[#F0F8FF] transition-colors text-base shadow-lg"
          >
            Create your free account
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 border-t border-[#F3F4F6]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <Image
              src="/colored-logo.svg"
              alt="DormSy"
              width={24}
              height={24}
              className="rounded-md opacity-70"
            />
            <span>
              © {new Date().getFullYear()} DormSy. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#00599B] transition-colors">Terms</Link>
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
