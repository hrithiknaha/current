const router = require("express").Router();

const moviesController = require("../controllers/moviesController");

router.post("/search", moviesController.searchMovie);
router.get("/:movieId", moviesController.getMovies);
router.post("/add", moviesController.addMovies);

module.exports = router;
