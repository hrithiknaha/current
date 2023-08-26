const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.Authorization || req.headers.authorization;

        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({
                success: false,
                status_message: "No authorization token found. Cannot verify request. Request unauthorized.",
            });

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decoded.username !== "admin") throw new Error("Not an authorised admin");

        req.user = decoded.username;

        const user = await User.findOne({ username: decoded.username }).lean();

        if (user) next();
        else throw new Error("User not registered.");
    } catch (error) {
        res.statusCode = 401;
        next(error);
    }
};

module.exports = verifyJWT;
