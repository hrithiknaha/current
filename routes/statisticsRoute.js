const router = require("express").Router();

const statisticsController = require("../controllers/statisticsController");

router.get("/:username/movies", statisticsController.totalMovieStats);
router.get("/:username/series", statisticsController.totalSeriesStats);
router.get("/:username", statisticsController.totalStats);

module.exports = router;
