const axios = require("axios");

const { logEvents } = require("../middlewares/logger");
const searchAppender = require("../helpers/searchLodash");

const tmdbController = {
    searchMovie: async (req, res, next) => {
        try {
            logEvents(`Searching resrouce ${req.body.movie_id} from TMDB`, "appLog.log");

            const queryString = req.body.query;
            const language = req.body.language;
            const page = req.body.page;

            const query = searchAppender(queryString);

            const response = await axios.get(`/search/movie?query=${query}&language=${language}&page=${page}`);

            return res.status(200).json(response.data);
        } catch (error) {
            next(error);
        }
    },

    getMovieDetails: async (req, res, next) => {
        try {
            logEvents(`Fetching resrouce ${req.body.movie_id} details from TMDB`, "appLog.log");

            const response = await axios.get(`/movie/${req.params.movieId}?append_to_response=credits`);

            if (!response?.data)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found at TMDB",
                    data: {},
                });

            return res.status(200).json(response.data);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = tmdbController;
