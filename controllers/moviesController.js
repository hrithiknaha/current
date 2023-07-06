const axios = require("axios");

const searchAppender = require("../helpers/searchLodash");
const { logEvents } = require("../middlewares/logger");

const Movie = require("../models/Movies");

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

const movieController = {
    searchMovie: async (req, res, next) => {
        try {
            logEvents("Searching for movie " + req.body.query, "appLog.log");
            const queryString = req.body.query;
            const language = req.body.language;
            const page = req.body.page;

            const query = searchAppender(queryString);
            const response = await axios.get(`/search/movie?query=${query}&language=${language}&page=${page}`);

            logEvents("Response sent for queried movie", "appLog.log");

            return res.status(200).json(response.data);
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    getMovies: async (req, res, next) => {
        try {
            logEvents("Fetching for movie " + req.params.movieId, "appLog.log");
            const response = await axios.get(`/movie/${req.params.movieId}`);

            logEvents("Response sent for " + req.params.movieId, "appLog.log");
            return res.status(200).json(response.data);
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    addMovies: async (req, res, next) => {
        try {
            const { theatre, rating, movieId } = req.body;
            const response = await axios.get(`/movie/${movieId}`);
            const { id, original_title } = response.data;
            Movie.create({ id, title: original_title, theatre, rating });
            return res.status(201).json("Created");
        } catch (error) {
            console.log("Error!!", error);
        }
    },
};

module.exports = movieController;
