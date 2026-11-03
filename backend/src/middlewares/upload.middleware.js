import multer from "multer";

const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter(req, file, callback) {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Only image files are supported."));
        }
        callback(null, true);
    }
})

export function uploadProductImage(req, res, next) {
    upload.single("image")(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError) {
            const tooLarge = error.code === "LIMIT_FILE_SIZE";
            return res.status(tooLarge ? 413 : 400).json({
                message: tooLarge
                    ? "Product images must be 5 MB or smaller."
                    : "Please upload one product image."
            });
        }
        if (error.message === "Only image files are supported.") {
            return res.status(400).json({ message: error.message });
        }
        return next(error);
    });
}

export default upload