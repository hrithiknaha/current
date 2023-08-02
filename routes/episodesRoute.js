const router = require("express").Router();

const episodesController = require("../controllers/episodesController");

router.get("/", episodesController.getAllEpisodes);

module.exports = router;
