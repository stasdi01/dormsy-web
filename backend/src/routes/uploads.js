const express = require("express");
const router = express.Router();
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/") && file.mimetype !== "") {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * POST /uploads/listing-photo
 * Uploads a single listing photo to Supabase Storage
 */
router.post("/listing-photo", requireAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo provided" });
  }

  const userId = req.user.id;

  // Convert HEIC/HEIF to JPEG on the backend
  const isHeic = req.file.mimetype === "image/heic" || req.file.mimetype === "image/heif"
    || req.file.originalname?.toLowerCase().endsWith(".heic")
    || req.file.originalname?.toLowerCase().endsWith(".heif");

  let buffer = req.file.buffer;
  let contentType = req.file.mimetype || "image/jpeg";
  let ext = contentType.split("/")[1] || "jpg";

  if (isHeic) {
    try {
      buffer = await sharp(req.file.buffer).jpeg({ quality: 85 }).toBuffer();
      contentType = "image/jpeg";
      ext = "jpg";
      console.log("[uploads] HEIC converted to JPEG successfully");
    } catch (err) {
      console.error("[uploads] HEIC conversion failed:", err.message);
      // Fall back to uploading as-is and let Supabase handle it
      contentType = "image/jpeg";
      ext = "jpg";
    }
  }

  const filename = `listings/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("dormsy")
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { data: { publicUrl } } = supabase.storage
    .from("dormsy")
    .getPublicUrl(filename);

  return res.json({ url: publicUrl });
});

/**
 * POST /uploads/avatar
 * Uploads a user avatar to Supabase Storage
 */
router.post("/avatar", requireAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo provided" });
  }

  const userId = req.user.id;
  const ext = req.file.mimetype.split("/")[1];
  const filename = `avatars/${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("dormsy")
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

  if (error) return res.status(500).json({ error: error.message });

  const { data: { publicUrl } } = supabase.storage
    .from("dormsy")
    .getPublicUrl(filename);

  return res.json({ url: publicUrl });
});

module.exports = router;
