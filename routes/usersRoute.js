const usersController = require("../controllers/usersController");

const router = require("express").Router();

router.get("/:username", usersController.getUserDetails);
router.get("/added/:movieId", usersController.userAddedMovie);

module.exports = router;
