const usersController = require("../controllers/usersController");

const router = require("express").Router();

router.post("/", usersController.searchUsers);
router.get("/:username", usersController.getUserDetails);
router.get("/:username/friends", usersController.getFriends);
router.get("/follow/:username", usersController.followUser);
router.get("/follow/:username/remove", usersController.removeUser);

//Not Used
router.get("/added/:movieId", usersController.userAddedMovie);

module.exports = router;
