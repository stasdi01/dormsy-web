/**
 * Converts a HEIC/HEIF file to JPEG using the heic2any library (loaded dynamically).
 * Falls through for non-HEIC files.
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
  } catch (err) {
    console.error("[convertIfHeic] conversion failed:", err);
    // Return original file and let the backend handle it or show an upload error
    return file;
  }
}
