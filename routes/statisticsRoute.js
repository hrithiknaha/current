const router = require("express").Router();

const statisticsController = require("../controllers/statisticsController");

router.get("/:username/movies/lastwentyweeks/:week", statisticsController.lastTwentyWeeksMovie);
router.get("/:username/movies/hourofday/:hour", statisticsController.hourOfDayMovie);
router.get("/:username/movies/dayofweek/:day", statisticsController.dayOfWeek);
router.get("/:username/movies/month/:month", statisticsController.month);
router.get("/:username/movies/year/:year", statisticsController.year);
router.get("/:username/movies/genre/:genre", statisticsController.getMovieGenre);
router.get("/:username/movies/language/:language", statisticsController.language);
router.get("/:username/movies/productioncountry/:country", statisticsController.productionCountry);
router.get("/:username/movies/actor/:actor", statisticsController.actor);
router.get("/:username/movies/director/:director", statisticsController.director);
router.get("/:username/movies/production/:production", statisticsController.production);

router.get("/:username/shows/genre/:genre", statisticsController.getShowsGenre);
router.get("/:username/shows/status/:status", statisticsController.getShowsStatus);
router.get("/:username/shows/language/:language", statisticsController.getShowsLanguage);
router.get("/:username/shows/origincountry/:country", statisticsController.getShowsOriginCountry);
router.get("/:username/shows/productioncountry/:country", statisticsController.getShowsProductionCountry);
router.get("/:username/shows/lastwentyweeks/:week", statisticsController.getShowsLastTwentyWeeks);
router.get("/:username/shows/hourofday/:hour", statisticsController.getShowsHour);
router.get("/:username/shows/weekday/:day", statisticsController.getShowsWeekday);
router.get("/:username/shows/month/:month", statisticsController.getShowsMonth);
router.get("/:username/shows/year/:year", statisticsController.getShowsYear);
router.get("/:username/shows/productioncompany/:production", statisticsController.getShowsProductionCompany);
router.get("/:username/shows/network/:network", statisticsController.getShowsNetwork);

router.get("/:username/movies", statisticsController.totalMovieStats);
router.get("/:username/series", statisticsController.totalSeriesStats);
router.get("/:username", statisticsController.totalStats);

module.exports = router;
