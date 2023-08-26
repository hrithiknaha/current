require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = require("./configs/corsOptions");
const connectDB = require("./configs/db");
const { logger } = require("./middlewares/logger");
const verifyJWT = require("./middlewares/verifyJWT");
const verifyAdminJWT = require("./middlewares/verifyAdminJWT");
const moviesRoute = require("./routes/moviesRoute");
const authRoute = require("./routes/authRoute");
const statisticsRoute = require("./routes/statisticsRoute");
const tmdbRoute = require("./routes/tmdbRoute");
const userRoute = require("./routes/usersRoute");
const seriesRoute = require("./routes/seriesRoute");
const episodesRoute = require("./routes/episodesRoute");
const adminRoute = require("./routes/adminRoute");

const errorHandler = require("./middlewares/errorHandler");

console.log("Running on", process.env.NODE_ENV);
connectDB();
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

app.use("/api/admin", verifyAdminJWT, adminRoute);
app.use("/api/tmdb", tmdbRoute);
app.use("/api/auth", authRoute);
app.use("/api/movies", verifyJWT, moviesRoute);
app.use("/api/series", verifyJWT, seriesRoute);
app.use("/api/episodes", verifyJWT, episodesRoute);
app.use("/api/stats", verifyJWT, statisticsRoute);
app.use("/api/users", verifyJWT, userRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

mongoose.connection.once("open", () => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
