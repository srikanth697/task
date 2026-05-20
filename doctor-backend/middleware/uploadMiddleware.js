const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExt);
    },
});

// File filter validator (Accept all standard documents and image extensions)
const fileFilter = (req, file, cb) => {
    // Allowed extensions: images (jpg, jpeg, png, gif, bmp, webp, heic, heif, tiff) and docs (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, odt)
    const allowedExtensions = /jpeg|jpg|png|gif|bmp|webp|heic|heif|tiff|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt/i;
    const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    if (extName) {
        cb(null, true);
    } else {
        const error = new Error("Unsupported file format. Only PDF, Word, Excel, PowerPoint, Text documents, and standard images are allowed.");
        error.status = 400;
        cb(error);
    }
};

// Multer upload configurations
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter: fileFilter,
});

module.exports = upload;
