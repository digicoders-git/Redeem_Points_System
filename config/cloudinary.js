import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadDir = "uploads/bills";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image (jpg, png) or PDF files are allowed"), false);
  }
};

export const uploadBillFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
}).single("billFile");
