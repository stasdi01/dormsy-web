import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };
  return (
    <Link href="/" className="inline-flex items-center gap-1.5 min-h-0">
      <span className={`font-bold tracking-tight text-[#00599B] ${sizes[size]}`}>
        Dorm
      </span>
      <span className={`font-bold tracking-tight text-[#111827] ${sizes[size]}`}>
        Sy
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] mb-0.5" />
    </Link>
  );
}
