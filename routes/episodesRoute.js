const router = require("express").Router();

const episodesController = require("../controllers/episodesController");

router.get("/:username", episodesController.getAllEpisodes);
router.get("/:username/continue/watching", episodesController.getNextEpisode);

module.exports = router;
