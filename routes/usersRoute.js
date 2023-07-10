const usersController = require("../controllers/usersController");

const router = require("express").Router();

router.get("/:username", usersController.getUserDetails);

module.exports = router;
