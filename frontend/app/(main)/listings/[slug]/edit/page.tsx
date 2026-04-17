"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { convertIfHeic } from "@/lib/utils/convertHeic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Category, Condition, Listing } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "textbooks", label: "Textbooks" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "clothes", label: "Clothes" },
  { value: "other", label: "Other" },
];

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: "new", label: "New", desc: "Never used, with tags" },
  { value: "like_new", label: "Like New", desc: "Used once or twice" },
  { value: "good", label: "Good", desc: "Some signs of use" },
  { value: "used", label: "Used", desc: "Visible wear" },
];

const MAX_PHOTOS = 5;
const TITLE_MAX = 60;
const DESC_MAX = 300;

type PhotoSlot = {
  preview: string;
  url: string;
  isExisting: boolean;
  file?: File;
  uploading?: boolean;
  error?: string;
};

export default function EditListingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const token = await getAuthToken();
      if (!token) return;

      try {
        // Fetch listing by slug from backend
        const res = await fetch(`${API_URL}/listings/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { router.push("/my-listings"); return; }
        const data = await res.json();
        const l: Listing = data.listing;

        // Verify ownership via /auth/me
        const meData = await apiRequest<{ user: { id: string } }>("/auth/me", { token });
        if (meData.user.id !== l.user_id) { router.push("/my-listings"); return; }

        setListing(l);
        setTitle(l.title);
        setDescription(l.description ?? "");
        setPrice(l.price % 1 === 0 ? String(l.price) : l.price.toFixed(2));
        setCategory(l.category);
        setCondition(l.condition);
        setIsNegotiable(l.is_negotiable ?? false);

        const existingPhotos: PhotoSlot[] = (l.listing_photos ?? [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((p) => ({ preview: p.storage_url, url: p.storage_url, isExisting: true }));
        setPhotos(existingPhotos);
      } catch {
        router.push("/my-listings");
      }
      setLoading(false);
    }
    load();
  }, [slug, router]);

  async function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    const remaining = MAX_PHOTOS - photos.length;
    let toAdd: File[];
    try {
      toAdd = await Promise.all(files.slice(0, remaining).map(convertIfHeic));
    } catch {
      setErrors({ photos: "Could not process HEIC photo. Please go to your iPhone Settings → Camera → Formats and select 'Most Compatible', then retake the photo." });
      return;
    }

    const slots: PhotoSlot[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: "",
      isExisting: false,
      uploading: true,
    }));

    setPhotos((prev) => [...prev, ...slots]);

    const token = await getAuthToken();
    if (!token) {
      setPhotos((prev) =>
        prev.map((p) =>
          slots.some((s) => s.preview === p.preview)
            ? { ...p, uploading: false, error: "Not authenticated" }
            : p
        )
      );
      return;
    }

    for (const slot of slots) {
      const formData = new FormData();
      formData.append("photo", slot.file!);
      try {
        const res = await fetch(`${API_URL}/uploads/listing-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setPhotos((prev) =>
          prev.map((p) =>
            p.preview === slot.preview ? { ...p, url: data.url, uploading: false } : p
          )
        );
      } catch (err) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.preview === slot.preview
              ? { ...p, uploading: false, error: err instanceof Error ? err.message : "Upload failed" }
              : p
          )
        );
      }
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = [...prev];
      if (!updated[index].isExisting) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    else if (title.length > TITLE_MAX) e.title = `Max ${TITLE_MAX} characters`;
    if (description.length > DESC_MAX) e.description = `Max ${DESC_MAX} characters`;
    if (price === "") e.price = "Price is required";
    else if (isNaN(Number(price)) || Number(price) < 0) e.price = "Enter a valid price";
    if (!category) e.category = "Select a category";
    if (!condition) e.condition = "Select a condition";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate() || !listing) return;

    if (photos.some((p) => p.uploading)) {
      setErrors({ photos: "Please wait for photos to finish uploading" });
      return;
    }
    if (photos.find((p) => p.error)) {
      setErrors({ photos: "One or more photos failed. Remove them and try again." });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAuthToken();
      await apiRequest(`/listings/${listing.id}`, {
        method: "PATCH",
        token,
        body: {
          title: title.trim(),
          description: description.trim() || null,
          price: Number(price),
          category,
          condition,
          is_negotiable: isNegotiable,
          photo_urls: photos.filter((p) => p.url).map((p) => p.url),
        },
      });
      router.push(`/listings/${slug}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Something went wrong" });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto animate-pulse flex flex-col gap-6">
        <div className="h-8 bg-[#F3F4F6] rounded w-1/3" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-24 h-24 bg-[#F3F4F6] rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-[#F3F4F6] rounded" />
        <div className="h-20 bg-[#F3F4F6] rounded" />
        <div className="h-10 bg-[#F3F4F6] rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          style={{ minHeight: 0 }}
          className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Edit listing</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Changes go live immediately.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Photos */}
        <div>
          <p className="text-sm font-medium text-[#374151] mb-2">
            Photos <span className="text-[#9CA3AF] font-normal">({photos.length}/{MAX_PHOTOS})</span>
          </p>
          <div className="flex gap-3 flex-wrap">
            {photos.map((photo, i) => (
              <div
                key={photo.preview}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                {photo.uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {photo.error && (
                  <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303-3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l5.354 9.248zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                  style={{ minHeight: 0 }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#00599B] hover:bg-[#F0F7FF] transition-colors flex flex-col items-center justify-center gap-1 text-[#9CA3AF] hover:text-[#00599B] flex-shrink-0"
                style={{ minHeight: 0 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] font-medium">Add photo</span>
              </button>
            )}
          </div>
          {errors.photos && <p className="text-xs text-red-500 mt-2">{errors.photos}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={handlePhotoPick}
          />
        </div>

        {/* Title */}
        <div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }}
            error={errors.title}
          />
          <p className={`text-xs mt-1 text-right ${title.length > TITLE_MAX ? "text-red-500" : "text-[#9CA3AF]"}`}>
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">
            Description <span className="text-[#9CA3AF] font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors((p) => ({ ...p, description: "" })); }}
            rows={3}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors resize-none ${errors.description ? "border-red-400" : "border-[#E5E7EB]"}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
            <p className={`text-xs ${description.length > DESC_MAX ? "text-red-500" : "text-[#9CA3AF]"}`}>
              {description.length}/{DESC_MAX}
            </p>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-[#9CA3AF] text-sm pointer-events-none">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => { setPrice(e.target.value); if (errors.price) setErrors((p) => ({ ...p, price: "" })); }}
              className={`w-full pl-7 pr-4 py-2.5 bg-white border rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors ${errors.price ? "border-red-400" : "border-[#E5E7EB]"}`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}

          {/* Negotiable toggle */}
          <button
            type="button"
            onClick={() => setIsNegotiable((v) => !v)}
            style={{ minHeight: 0 }}
            className={`mt-3 flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors w-fit ${
              isNegotiable
                ? "bg-[#E6F0F9] border-[#00599B] text-[#00599B]"
                : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#00599B] hover:text-[#00599B]"
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isNegotiable ? "bg-[#00599B] border-[#00599B]" : "border-[#D1D5DB]"}`}>
              {isNegotiable && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            Price is negotiable
          </button>
        </div>

        {/* Category */}
        <div>
          <p className="text-sm font-medium text-[#374151] mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { setCategory(cat.value); if (errors.category) setErrors((p) => ({ ...p, category: "" })); }}
                style={{ minHeight: 0 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  category === cat.value
                    ? "bg-[#00599B] text-white border-[#00599B]"
                    : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#00599B] hover:text-[#00599B]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category}</p>}
        </div>

        {/* Condition */}
        <div>
          <p className="text-sm font-medium text-[#374151] mb-2">Condition</p>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((cond) => (
              <button
                key={cond.value}
                type="button"
                onClick={() => { setCondition(cond.value); if (errors.condition) setErrors((p) => ({ ...p, condition: "" })); }}
                style={{ minHeight: 0 }}
                className={`px-3 py-2.5 rounded-xl text-left border transition-colors ${
                  condition === cond.value
                    ? "bg-[#E6F0F9] border-[#00599B]"
                    : "bg-white border-[#E5E7EB] hover:border-[#00599B]"
                }`}
              >
                <p className={`text-sm font-medium ${condition === cond.value ? "text-[#00599B]" : "text-[#374151]"}`}>
                  {cond.label}
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{cond.desc}</p>
              </button>
            ))}
          </div>
          {errors.condition && <p className="text-xs text-red-500 mt-2">{errors.condition}</p>}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={submitting}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
