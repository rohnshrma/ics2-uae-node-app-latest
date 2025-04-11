import multer from "multer";
import path from "path";

// Set up storage and filename configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Save the file with a unique timestamp and original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, and .jpeg formats are allowed!"));
  }
};

// Export the Multer configuration
export const upload = multer({ storage, fileFilter });
