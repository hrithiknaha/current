const router = require("express").Router();

const statisticsController = require("../controllers/statisticsController");

router.get("/movies", statisticsController.totalStats);

module.exports = router;
