const router = require("express").Router();

const adminController = require("../controllers/adminController");

router.get("/movies", adminController.getMovies);
router.put("/movies/:movieId", adminController.editMovie);

router.get("/series", adminController.getSeries);
router.put("/series/:seriesId", adminController.editSeries);

module.exports = router;
