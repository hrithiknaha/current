const router = require("express").Router();
const multer = require("multer");

const adminController = require("../controllers/adminController");

const upload = multer({ dest: "uploads/" });

router.get("/bulk/movies", upload.single("csvFile"), adminController.bulkUploadMovies);

module.exports = router;
