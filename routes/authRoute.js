const router = require("express").Router();

const authRoute = require("../controllers/authController");

router.post("/register", authRoute.registerUser);
router.post("/login", authRoute.loginUser);
router.get("/refresh", authRoute.refreshUser);
router.get("/logout", authRoute.logoutUser);

module.exports = router;
