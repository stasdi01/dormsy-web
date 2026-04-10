import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
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

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-[#E6F0F9] rounded-3xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#00599B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>

        <p className="text-sm font-semibold text-[#00599B] uppercase tracking-widest mb-3">404</p>
        <h1 className="text-3xl font-extrabold text-[#111827] mb-3">Page not found</h1>
        <p className="text-[#6B7280] max-w-sm mb-10">
          Looks like this page moved out of the dorm. It might have been removed or the link is broken.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#00599B] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#004d87] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go home
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#374151] font-semibold px-6 py-3 rounded-xl hover:border-[#00599B] hover:text-[#00599B] transition-colors text-sm"
          >
            Browse listings
          </Link>
        </div>
      </div>
    </div>
  );
}
