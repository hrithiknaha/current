const axios = require("axios");

const { logEvents } = require("../middlewares/logger");
const { searchAppender } = require("../helpers/utils");

const tmdbController = {
    searchMovie: async (req, res, next) => {
        try {
            logEvents(`Searching resrouce ${req.body.query} from TMDB`, "appLog.log");

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
            logEvents(`Fetching resrouce ${req.params.movieId} details from TMDB`, "appLog.log");

            const response = await axios.get(`/movie/${req.params.movieId}?append_to_response=credits`);

            return res.status(200).json(response.data);
        } catch (error) {
            error.message = "The resource you requested could not be found at TMDB";
            res.status(404);
            next(error);
        }
    },

    searchSeries: async (req, res, next) => {
        try {
            logEvents(`Searching resrouce ${req.body.query} from TMDB`, "appLog.log");

            const queryString = req.body.query;
            const language = req.body.language;
            const page = req.body.page;

            const query = searchAppender(queryString);

            const response = await axios.get(`/search/tv?query=${query}&language=${language}&page=${page}`);

            return res.status(200).json(response.data);
        } catch (error) {
            next(error);
        }
    },

    getSeriesDetails: async (req, res, next) => {
        try {
            logEvents(`Fetching resrouce ${req.params.tvId} details from TMDB`, "appLog.log");

            const response = await axios.get(`/tv/${req.params.seriesId}?append_to_response=credits`);

            if (!response?.data)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found at TMDB",
                    data: {},
                });

            return res.status(200).json(response.data);
        } catch (error) {
            error.message = "The resource you requested could not be found at TMDB";
            res.status(404);
            next(error);
        }
    },

    getSeriesSeasonDetails: async (req, res, next) => {
        try {
            logEvents(
                `Fetching resource ${req.params.seriesId} seasond ${req.params.seasonNumber} details from TMDB`,
                "appLog.log"
            );

            const response = await axios.get(
                `/tv/${req.params.seriesId}/season/${req.params.seasonNumber}?append_to_response=credits`
            );

            return res.status(200).json(response.data);
        } catch (error) {
            error.message = "The resource you requested could not be found at TMDB";
            res.status(404);
            next(error);
        }
    },

    getSeriesEpisodesDetails: async (req, res, next) => {
        try {
            logEvents(
                `Fetching resource ${req.params.seriesId} season ${req.params.seasonNumber} episode ${req.params.episodeNumber} details from TMDB`,
                "appLog.log"
            );

            const response = await axios.get(
                `/tv/${req.params.seriesId}/season/${req.params.seasonNumber}/episode/${req.params.episodeNumber}?append_to_response=credits`
            );

            return res.status(200).json(response.data);
        } catch (error) {
            error.message = "The resource you requested could not be found at TMDB";
            res.status(404);
            next(error);
        }
    },

    getPersonDetails: async (req, res, next) => {
        try {
            logEvents(`Fetching resrouce ${req.params.personId} details from TMDB`, "appLog.log");

            const response = await axios.get(`/person/${req.params.personId}?append_to_response=combined_credits`);

            return res.status(200).json(response.data);
        } catch (error) {
            error.message = "The resource you requested could not be found at TMDB";
            res.status(404);
            next(error);
        }
    },

    getTrending: async (req, res, next) => {
        try {
            logEvents(`Fetching all day trending details from TMDB`, "appLog.log");

            const response = await axios.get(`trending/all/day`);

            return res.status(200).json(response.data);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = tmdbController;
