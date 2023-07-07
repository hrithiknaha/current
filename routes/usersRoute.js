const router = require("express").Router();

const usersController = require("../controllers/usersController");

router.post("/register", usersController.registerUser);
router.post("/login", usersController.loginUser);
router.get("/refresh", usersController.refreshUser);
router.get("/logout", usersController.logoutUser);

module.exports = router;
