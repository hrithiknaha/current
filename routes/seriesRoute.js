const router = require("express").Router();

const seriesController = require("../controllers/seriesController");

router.post("/add", seriesController.addSeries);
router.post("/watch", seriesController.watchEpisode);
router.get("/", seriesController.showAllSeries);
router.get("/:seriesId", seriesController.showSeries);

//Episodes

router.get("/:seriesId/season/:seasonNumber", seriesController.showWatchedEpisodeOfSeason);
router.get("/:seriesId/episodes", seriesController.showAllWatchedEpisode);
router.get("/:seriesId/episodes/:episodeId", seriesController.showWatchedEpisode);
router.patch("/:seriesId/episodes/:episodeId/rating", seriesController.editEpisodeRating);
router.patch("/:seriesId/episodes/:episodeId/date-watched", seriesController.editEpisodeDateWatched);

module.exports = router;
