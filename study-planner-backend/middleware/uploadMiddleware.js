const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// file filter
const fileFilter = function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF allowed"), false);
    }
};

// create upload object
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// EXPORT CORRECTLY
module.exports = upload;