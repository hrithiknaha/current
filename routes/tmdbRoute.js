const router = require("express").Router();

const tmdbController = require("../controllers/tmdbController");

router.post("/movies/search", tmdbController.searchMovie);
router.get("/movies/:movieId", tmdbController.getMovieDetails);
router.post("/series/search", tmdbController.searchSeries);
router.get("/series/:seriesId", tmdbController.getSeriesDetails);
router.get("/series/:seriesId/season/:seasonNumber", tmdbController.getSeriesSeasonDetails);
router.get("/series/:seriesId/season/:seasonNumber/episode/:episodeNumber", tmdbController.getSeriesEpisodesDetails);

module.exports = router;
