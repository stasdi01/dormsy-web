"use client";

import Link from "next/link";

/**
 * The SVG viewBox is "0 0 486 486" (square).
 * Icon (buildings + bag) occupies the top ~57% of the image.
 * Text "DormSy" occupies roughly y=285–420.
 *
 * For variant="icon" we crop to the top 57% by:
 *   - Setting the container to the icon height
 *   - Making the <img> full square (full image)
 *   - Hiding the overflow (text gets clipped off)
 */

const SIZES = {
  sm: { full: 44, icon: 28 },
  md: { full: 80, icon: 52 },
  lg: { full: 120, icon: 76 },
};

// Ratio of icon area height to total image height (icon takes top 57%)
const ICON_RATIO = 0.57;

type Props = {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  href?: string;
};

function LogoImage({ size = "md", variant = "full" }: { size: "sm" | "md" | "lg"; variant: "full" | "icon" }) {
  const dims = SIZES[size];

  if (variant === "full") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/colored-logo.svg"
        alt="DormSy"
        width={dims.full}
        height={dims.full}
        style={{ display: "block" }}
      />
    );
  }

  // icon variant: show only the top ICON_RATIO of the square image
  const containerSize = dims.icon;
  const imgSize = Math.round(containerSize / ICON_RATIO);

  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/colored-logo.svg"
        alt="DormSy"
        width={imgSize}
        height={imgSize}
        style={{ display: "block" }}
      />
    </div>
  );
}

export function DormSyLogo({ size = "md", variant = "full", href = "/" }: Props) {
  return (
    <Link href={href} className="inline-flex items-center min-h-0">
      <LogoImage size={size} variant={variant} />
    </Link>
  );
}
