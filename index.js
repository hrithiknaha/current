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
const moviesRoute = require("./routes/moviesRoute");
const authRoute = require("./routes/authRoute");
const statisticsRoute = require("./routes/statisticsRoute");
const tmdbRoute = require("./routes/tmdbRoute");
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/usersRoute");

const errorHandler = require("./middlewares/errorHandler");

connectDB();
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

app.use("/api/tmdb", tmdbRoute);
app.use("/api/auth", authRoute);
app.use("/api/movies", verifyJWT, moviesRoute);
app.use("/api/stats", verifyJWT, statisticsRoute);
app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

mongoose.connection.once("open", () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
