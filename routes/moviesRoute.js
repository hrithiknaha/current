const router = require("express").Router();

const moviesController = require("../controllers/moviesController");

router.post("/tmdb/search", moviesController.searchMovie);
router.get("/tmdb/:movieId", moviesController.getMovieDetails);
router.post("/add", moviesController.addMovie);
router.get("/:movieId", moviesController.readMovie);
router.get("/", moviesController.readMovies);
router.delete("/:movieId", moviesController.deleteMovie);
router.patch("/rating", moviesController.editRating);

module.exports = router;
