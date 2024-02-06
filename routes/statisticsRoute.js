const router = require("express").Router();

const statisticsController = require("../controllers/statisticsController");

router.get("/:username/movies/lastwentyweeks/:week", statisticsController.lastTwentyWeeksMovie);
router.get("/:username/movies/hourofday/:hour", statisticsController.hourOfDayMovie);
router.get("/:username/movies/dayofweek/:day", statisticsController.dayOfWeek);
router.get("/:username/movies/month/:month", statisticsController.month);
router.get("/:username/movies/year/:year", statisticsController.year);
router.get("/:username/movies/genre/:genre", statisticsController.genre);
router.get("/:username/movies/language/:language", statisticsController.language);
router.get("/:username/movies/productioncountry/:country", statisticsController.productionCountry);
router.get("/:username/movies/actor/:actor", statisticsController.actor);
router.get("/:username/movies/director/:director", statisticsController.director);
router.get("/:username/movies/production/:production", statisticsController.production);

router.get("/:username/movies", statisticsController.totalMovieStats);
router.get("/:username/series", statisticsController.totalSeriesStats);
router.get("/:username", statisticsController.totalStats);

module.exports = router;
