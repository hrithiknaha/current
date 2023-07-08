const axios = require("axios");

const { logEvents } = require("../middlewares/logger");
const searchAppender = require("../helpers/searchLodash");

const tmdbController = {
    //TMDB
    searchMovie: async (req, res, next) => {
        try {
            logEvents("Searching for movie from tmdb" + req.body.query, "appLog.log");
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

    getMovieDetails: async (req, res, next) => {
        try {
            logEvents("Fetching for movie from tmdb" + req.params.movieId, "appLog.log");
            const response = await axios.get(`/movie/${req.params.movieId}?append_to_response=credits`);

            logEvents("Response sent for " + req.params.movieId, "appLog.log");
            return res.status(200).json(response.data);
        } catch (error) {
            console.log("Error!!", error);
        }
    },
};

module.exports = tmdbController;
