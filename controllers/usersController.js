const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { logEvents } = require("../middlewares/logger");
const User = require("../models/Users");

const usersController = {
    registerUser: async (req, res, next) => {
        logEvents("Registering new user", "appLog.log");

        const { firstname, lastname, username, password } = req.body;

        if (!firstname || !lastname || !username || !password) return res.status(400).json("All fields are required");

        const duplicate = await User.findOne({ username });

        if (duplicate) return res.status(409).json("Username already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ firstname, lastname, username, password: hashedPassword });
        return res.status(201).json("User registered");
    },

    loginUser: async (req, res, next) => {
        logEvents("Logging with user", "appLog.log");

        const { username, password } = req.body;

        if (!username || !password) return res.status(400).json("All fields are required");

        const foundUser = await User.findOne({ username });

        if (!foundUser) return res.status(401).json("Unauthorized");

        const match = bcrypt.compare(password, foundUser.password);
        if (!match) return res.status(401).json({ message: "Unauthorized" });

        const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", refreshToken, {
            httpOnly: true, //accessible only by web server
            secure: true, //https
            sameSite: "None", //cross-site cookie
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
        });

        res.json({ accessToken, expiresIn: 15 * 60 * 1000 });
    },

    refreshUser: async (req, res, next) => {
        try {
            logEvents("Refreshing user token", "appLog.log");
            const cookies = req.cookies;

            if (!cookies?.jwt) return res.status(401).json("Unauthorized");

            const refreshToken = cookies.jwt;

            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const foundUser = await User.findOne({ username: decoded.username });

            if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

            const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

            res.json({ accessToken, expiresIn: 15 * 60 * 1000 });
        } catch (error) {
            console.log(error);
            return res.status(403).json("Forbidden");
        }
    },

    logoutUser: async (req, res, next) => {
        logEvents("Logout user", "appLog.log");

        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
        res.json({ message: "Cookie cleared" });
    },
};

module.exports = usersController;
