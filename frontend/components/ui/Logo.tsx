import Link from "next/link";
import Image from "next/image";

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = sizes[size];
  return (
    <Link href="/" className="inline-flex items-center min-h-0">
      <Image
        src="/colored-logo.svg"
        alt="DormSy"
        width={px}
        height={px}
        priority
        className="rounded-sm"
      />
    </Link>
  );
}
