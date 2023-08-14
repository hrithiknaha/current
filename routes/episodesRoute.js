const router = require("express").Router();

const episodesController = require("../controllers/episodesController");

router.get("/:username", episodesController.getAllEpisodes);

module.exports = router;
