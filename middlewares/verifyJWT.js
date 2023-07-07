const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.Authorization || req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json("Unauthorized");

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.username;
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).json("Forbidden");
    }
};

module.exports = verifyJWT;
