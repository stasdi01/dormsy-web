"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/lib/utils/api";
import { convertIfHeic } from "@/lib/utils/convertHeic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Category, Condition } from "@/types";

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

const CONDITION_LABEL: Record<string, string> = {
  new: "New", like_new: "Like New", good: "Good", used: "Used",
};

const CATEGORY_LABEL: Record<string, string> = {
  textbooks: "Textbooks", electronics: "Electronics",
  furniture: "Furniture", clothes: "Clothes", other: "Other",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const MAX_PHOTOS = 5;
const TITLE_MAX = 60;
const DESC_MAX = 300;

type PhotoSlot = { file: File; preview: string; url?: string; uploading?: boolean; error?: string };

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `$${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}`;
}

export default function NewListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "preview" | "success">("form");
  const [publishedSlug, setPublishedSlug] = useState("");
  const [photos, setPhotos] = useState<PhotoSlot[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);

  async function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = await Promise.all(files.slice(0, remaining).map(convertIfHeic));

    const slots: PhotoSlot[] = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
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
      formData.append("photo", slot.file);
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
      URL.revokeObjectURL(updated[index].preview);
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

  function handlePreview(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (photos.some((p) => p.uploading)) {
      setErrors({ photos: "Please wait for photos to finish uploading" });
      return;
    }
    if (photos.find((p) => p.error)) {
      setErrors({ photos: "One or more photos failed to upload. Remove them and try again." });
      return;
    }

    setPreviewPhotoIndex(0);
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePublish() {
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const data = await apiRequest<{ listing: { slug: string } }>("/listings", {
        method: "POST",
        token,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          category,
          condition,
          is_negotiable: isNegotiable,
          photo_urls: photos.filter((p) => p.url).map((p) => p.url!),
        },
      });
      setPublishedSlug(data.listing.slug);
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Something went wrong" });
      setStep("form");
      setSubmitting(false);
    }
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center text-center py-16 px-4">
        <div className="w-20 h-20 bg-[#E8F7F2] rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">You&apos;re live!</h1>
        <p className="text-[#6B7280] text-sm mb-1">
          <span className="font-semibold text-[#111827]">&ldquo;{title}&rdquo;</span> is now visible to everyone at your college.
        </p>
        <p className="text-[#9CA3AF] text-sm mb-8">
          It will automatically expire in 30 days.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button fullWidth size="lg" onClick={() => router.push(`/listings/${publishedSlug}`)}>
            View my listing
          </Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => router.push("/feed")}>
            Back to feed
          </Button>
        </div>
      </div>
    );
  }

  // ── PREVIEW ──────────────────────────────────────────────────────────────
  if (step === "preview") {
    const previewPhotos = photos.filter((p) => p.url);
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Preview</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">This is how your listing will appear to buyers.</p>
          </div>
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
            style={{ minHeight: 0 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Photos */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden">
              {previewPhotos.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewPhotos[previewPhotoIndex].url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-[#D1D5DB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>
            {previewPhotos.length > 1 && (
              <div className="flex gap-2">
                {previewPhotos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewPhotoIndex(i)}
                    style={{ minHeight: 0 }}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${
                      i === previewPhotoIndex ? "border-[#00599B]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#F3F4F6] text-[#374151] text-xs font-medium px-2.5 py-1 rounded-full">
                {CATEGORY_LABEL[category] ?? category}
              </span>
              <span className="bg-[#F3F4F6] text-[#374151] text-xs font-medium px-2.5 py-1 rounded-full">
                {CONDITION_LABEL[condition] ?? condition}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#111827] leading-snug">{title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-[#00599B]">{formatPrice(Number(price))}</p>
                {isNegotiable && (
                  <span className="text-xs font-medium bg-[#E6F0F9] text-[#00599B] px-2 py-0.5 rounded-full">Negotiable</span>
                )}
              </div>
            </div>

            {description && (
              <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-3">
              <span>Just now</span>
              <span>0 views</span>
              <span>0 saves</span>
            </div>

            {/* Publish actions */}
            <div className="flex flex-col gap-3 pt-2">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
              <Button fullWidth size="lg" loading={submitting} onClick={handlePublish}>
                Publish listing
              </Button>
              <Button fullWidth size="lg" variant="secondary" onClick={() => setStep("form")}>
                Edit listing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Post a listing</h1>
        <p className="text-sm text-[#6B7280] mt-1">Fill in the details and your item goes live instantly.</p>
      </div>

      <form onSubmit={handlePreview} noValidate className="flex flex-col gap-6">

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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  style={{ minHeight: 0 }}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
            placeholder="e.g. Calculus textbook 8th edition"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((prev) => ({ ...prev, title: "" })); }}
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
            placeholder="Describe the item — condition details, why you're selling it, etc."
            value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors((prev) => ({ ...prev, description: "" })); }}
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
              placeholder="0.00"
              value={price}
              onChange={(e) => { setPrice(e.target.value); if (errors.price) setErrors((prev) => ({ ...prev, price: "" })); }}
              className={`w-full pl-7 pr-4 py-2.5 bg-white border rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00599B]/20 focus:border-[#00599B] transition-colors ${errors.price ? "border-red-400" : "border-[#E5E7EB]"}`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          <p className="text-xs text-[#9CA3AF] mt-1">Enter 0 for free items</p>

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
                onClick={() => { setCategory(cat.value); if (errors.category) setErrors((prev) => ({ ...prev, category: "" })); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  category === cat.value
                    ? "bg-[#00599B] text-white border-[#00599B]"
                    : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#00599B] hover:text-[#00599B]"
                }`}
                style={{ minHeight: 0 }}
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
                onClick={() => { setCondition(cond.value); if (errors.condition) setErrors((prev) => ({ ...prev, condition: "" })); }}
                className={`px-3 py-2.5 rounded-xl text-left border transition-colors ${
                  condition === cond.value
                    ? "bg-[#E6F0F9] border-[#00599B]"
                    : "bg-white border-[#E5E7EB] hover:border-[#00599B]"
                }`}
                style={{ minHeight: 0 }}
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

        <Button type="submit" fullWidth size="lg">
          Preview listing
        </Button>
      </form>
    </div>
  );
}
