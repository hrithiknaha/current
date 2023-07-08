const router = require("express").Router();

const tmdbController = require("../controllers/tmdbController");

router.post("/movies/search", tmdbController.searchMovie);
router.get("/movies/:movieId", tmdbController.getMovieDetails);

module.exports = router;
