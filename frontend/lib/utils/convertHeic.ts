/**
 * Converts a HEIC/HEIF file to JPEG using two strategies:
 * 1. Canvas — works on Safari/iOS which natively renders HEIC (tried first, no imports needed)
 * 2. heic2any (WASM) — fallback for Chrome/Firefox
 */
export async function convertIfHeic(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) return file;

  const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");

  // Strategy 1: Canvas — Safari/iOS natively renders HEIC so this works instantly there.
  // On Chrome/Firefox, img.onerror fires and we fall through to heic2any.
  try {
    const objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image load failed"));
      image.src = objectUrl;
    });
    URL.revokeObjectURL(objectUrl);

    if (!img.naturalWidth || !img.naturalHeight) throw new Error("Empty image");

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        "image/jpeg",
        0.85,
      ),
    );
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Canvas failed — try heic2any
  }

  // Strategy 2: heic2any (WASM) — works on Chrome/Firefox
  try {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // both failed
  }

  throw new Error("HEIC_CONVERSION_FAILED");
}
