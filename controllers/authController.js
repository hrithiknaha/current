const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { logEvents } = require("../middlewares/logger");
const User = require("../models/Users");

const authController = {
    registerUser: async (req, res, next) => {
        try {
            logEvents(`Registrating new user ${req.body.username}`, "appLog.log");

            const { firstname, lastname, username, password } = req.body;

            if (!firstname || !lastname || !username || !password)
                return res.status(400).json({
                    success: false,
                    status_message: "Required fields are missing.",
                });

            const duplicate = await User.findOne({ username });

            if (duplicate)
                return res.status(409).json({
                    success: false,
                    status_message: "Username is not unique.",
                });

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({ firstname, lastname, username, password: hashedPassword });

            const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
            const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

            res.cookie("jwt", refreshToken, {
                httpOnly: true, //accessible only by web server
                secure: true, //https
                sameSite: "None", //cross-site cookie
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(201).json({
                success: true,
                status_message: "New user registered.",
                data: { username, accessToken },
            });
        } catch (error) {
            next(error);
        }
    },

    loginUser: async (req, res, next) => {
        try {
            logEvents(`Logging with user ${req.body.username}`, "appLog.log");

            const { username, password } = req.body;

            if (!username || !password)
                return res.status(400).json({
                    success: false,
                    status_message: "Required fields are missing.",
                });

            const foundUser = await User.findOne({ username });

            if (!foundUser)
                return res.status(401).json({
                    success: false,
                    status_message: "Request Unauthorized",
                });

            bcrypt
                .compare(password, foundUser.password)
                .then((match) => {
                    if (match) {
                        const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: "1d",
                        });
                        const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
                            expiresIn: "7d",
                        });

                        res.cookie("jwt", refreshToken, {
                            httpOnly: true, //accessible only by web server
                            secure: true, //https
                            sameSite: "none", //cross-site cookie
                            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
                        });

                        res.status(200).json({ accessToken, expiresIn: 15 * 60 * 1000 });
                    } else {
                        return res.status(401).json({
                            success: false,
                            status_message: "Credentials does not match. Request Unauthorized",
                        });
                    }
                })
                .catch((err) => console.log(err));
        } catch (error) {
            next(error);
        }
    },

    refreshUser: async (req, res, next) => {
        try {
            logEvents("Refreshing token for user", "appLog.log");

            const refreshToken = req.cookies.jwt;

            if (!req.cookies?.jwt)
                return res.status(401).json({
                    success: false,
                    status_message: "Cookie does not have the required token. Request Unauthorized.",
                });

            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const foundUser = await User.findOne({ username: decoded.username });

            if (!foundUser)
                return res.status(401).json({
                    success: false,
                    status_message: "No match found. Request Unauthorized.",
                });

            const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d",
            });

            res.json({ accessToken, expiresIn: 1 * 60 * 1000 });
        } catch (error) {
            next(error);
        }
    },

    logoutUser: async (req, res, next) => {
        try {
            logEvents("User Logout", "appLog.log");

            const cookies = req.cookies;
            if (!cookies?.jwt)
                return res.status(204).json({
                    success: true,
                    status_message: "No Cookie found.",
                }); //No content

            res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
            res.json({
                success: true,
                status_message: "Cookies cleared. User logged out.",
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = authController;
