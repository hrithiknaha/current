const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const app = express();

const connectDB = require("./configs/db");
const { logger } = require("./middlewares/logger");
const moviesRoute = require("./routes/moviesRoute");

connectDB();
app.use(logger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

app.use("/api/movies", moviesRoute);

const PORT = process.env.PORT || 5001;

mongoose.connection.once("open", () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
