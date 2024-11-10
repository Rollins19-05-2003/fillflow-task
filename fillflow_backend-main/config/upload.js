const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.memoryStorage(); // Use memory storage to avoid saving files on disk

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("amazonCSV");

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /csv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: CSV Files Only!");
  }
}

module.exports = upload;
