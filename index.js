const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const app = express();
const dotenv = require("dotenv").config();
var cookieParser = require("cookie-parser");

const connectDB = require("./configs/db");
const { logger } = require("./middlewares/logger");
const verifyJWT = require("./middlewares/verifyJWT");
const moviesRoute = require("./routes/moviesRoute");
const usersRoute = require("./routes/usersRoute");
const statisticsRoute = require("./routes/statisticsRoute");

connectDB();
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

app.use("/api/movies", verifyJWT, moviesRoute);
app.use("/api/auth", usersRoute);
app.use("/api/stats", verifyJWT, statisticsRoute);

const PORT = process.env.PORT || 5001;

mongoose.connection.once("open", () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
