const router = require("express").Router();

const statisticsController = require("../controllers/statistics/userStatisticsController");
const movieController = require("../controllers/statistics/movieController");
const showController = require("../controllers/statistics/showController");

router.get("/:username/movies/week/:week", movieController.getMovieLastTwentyWeekStats);
router.get("/:username/movies/hour/:hour", movieController.getMovieHourOfDayStats);
router.get("/:username/movies/day/:day", movieController.getMovieDayOfWeekStats);
router.get("/:username/movies/month/:month", movieController.getMovieMonthStats);
router.get("/:username/movies/year/:year", movieController.getMovieYearStats);
router.get("/:username/movies/genre/:genre", movieController.getMovieGenreStats);
router.get("/:username/movies/language/:language", movieController.getMovieLanguageStats);
router.get("/:username/movies/production/country/:country", movieController.getMovieProductionCountryStats);
router.get("/:username/movies/production/company/:company", movieController.getMovieProductionCompanyStats);
router.get("/:username/movies/actor/:actor", movieController.getMovieActorStats);
router.get("/:username/movies/director/:director", movieController.getMovieDirectorStats);

router.get("/:username/shows/genre/:genre", showController.getShowGenreStats);
router.get("/:username/shows/status/:status", showController.getShowStatusStats);
router.get("/:username/shows/language/:language", showController.getShowLanguageStats);
router.get("/:username/shows/origin/country/:country", showController.getShowOriginCountryStats);
router.get("/:username/shows/production/country/:country", showController.getShowProductionCountryStats);
router.get("/:username/shows/week/:week", showController.getShowLastTwentyWeekStats);
router.get("/:username/shows/hour/:hour", showController.getShowHourOfDayStats);
router.get("/:username/shows/day/:day", showController.getShowDayOfWeekStats);
router.get("/:username/shows/month/:month", showController.getShowMonthStats);
router.get("/:username/shows/year/:year", showController.getShowYearStats);
router.get("/:username/shows/production/company/:company", showController.getShowProductionCompanyStats);
router.get("/:username/shows/network/:network", showController.getShowNetworkStats);

router.get("/:username", statisticsController.getAllStats);

//Archived
router.get("/:username/movies", statisticsController.getAllMovieStats);
router.get("/:username/series", statisticsController.getAllSeriesStats);

module.exports = router;
