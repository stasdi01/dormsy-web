/**
 * Converts a HEIC/HEIF file to JPEG.
 * Uses heic2any (works in browsers with proper CSP).
 * Falls through for non-HEIC files or if conversion fails.
 */
export async function convertIfHeic(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) return file;

  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // heic2any failed — show user-friendly error by returning a fake file
    // The upload will fail and show an error to the user
    throw new Error("HEIC_CONVERSION_FAILED");
  }
}
