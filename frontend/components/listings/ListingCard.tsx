import Link from "next/link";
import type { Listing } from "@/types";

const CONDITION_LABEL: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  used: "Used",
};

const CATEGORY_LABEL: Record<string, string> = {
  textbooks: "Textbooks",
  electronics: "Electronics",
  furniture: "Furniture",
  clothes: "Clothes",
  other: "Other",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

type Props = {
  listing: Listing;
};

export function ListingCard({ listing }: Props) {
  const photo = listing.listing_photos
    ?.sort((a, b) => a.order_index - b.order_index)[0];

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col"
    >
      {/* Photo */}
      <div className="aspect-square bg-[#F3F4F6] relative overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.storage_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        {/* Category pill */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#374151] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#E5E7EB]">
          {CATEGORY_LABEL[listing.category] ?? listing.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[#111827] font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {listing.title}
          </p>
          <p className="text-[#00599B] font-bold text-sm whitespace-nowrap">
            {formatPrice(listing.price)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[11px] text-[#9CA3AF] font-medium">
            {CONDITION_LABEL[listing.condition] ?? listing.condition}
          </span>
          <span className="text-[11px] text-[#9CA3AF]">
            {timeAgo(listing.created_at)}
          </span>
        </div>

        {listing.seller && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-[#F3F4F6] mt-1">
            <div className="w-4 h-4 rounded-full bg-[#E6F0F9] flex items-center justify-center overflow-hidden flex-shrink-0">
              {listing.seller.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.seller.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] text-[#00599B] font-bold">
                  {listing.seller.first_name?.[0] ?? "?"}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#6B7280] truncate">@{listing.seller.username}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
