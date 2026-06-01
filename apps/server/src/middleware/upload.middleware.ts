import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    callback(null, true);
  },
});
