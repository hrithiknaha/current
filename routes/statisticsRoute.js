const router = require("express").Router();

const statisticsController = require("../controllers/statisticsController");

router.get("/movies", statisticsController.totalMovieStats);
router.get("/series", statisticsController.totalSeriesStats);
router.get("/", statisticsController.totalStats);

module.exports = router;
