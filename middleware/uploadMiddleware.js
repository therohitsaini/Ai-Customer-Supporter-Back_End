import multer from "multer";

const storage = multer.memoryStorage(); // <--- store file in memory
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files allowed"), false);
    }
});

export default upload;