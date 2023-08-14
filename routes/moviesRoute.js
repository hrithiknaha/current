const router = require("express").Router();

const moviesController = require("../controllers/moviesController");

router.post("/add", moviesController.addMovie);
router.get("/:movieId", moviesController.readMovie);
router.get("/user/:username", moviesController.readMovies);
router.delete("/:movieId", moviesController.deleteMovie);
router.patch("/rating", moviesController.editRating);
router.patch("/date", moviesController.editDateWatched);

module.exports = router;
