const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.Authorization || req.headers.authorization;

        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({
                success: false,
                status_message: "No authorization token found. Cannot verify request. Request unauthorized.",
            });

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.username;
        next();
    } catch (error) {
        console.log("Caught error");
        res.statusCode = 401;
        next(error);
    }
};

module.exports = verifyJWT;
