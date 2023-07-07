const axios = require("axios");

const searchAppender = require("../helpers/searchLodash");
const { logEvents } = require("../middlewares/logger");

const Movie = require("../models/Movies");

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common["Authorization"] = "Bearer " + process.env.API_AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";

const movieController = {
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
            const response = await axios.get(`/movie/${req.params.movieId}`);

            logEvents("Response sent for " + req.params.movieId, "appLog.log");
            return res.status(200).json(response.data);
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    //Database
    readMovie: async (req, res, next) => {
        try {
            logEvents("Fetching for movie " + req.params.movieId, "appLog.log");
            const { movieId } = req.params;
            const movie = await Movie.findOne({ movieId });
            if (!movie) return res.status(200).json({});

            return res.status(200).json(movie);
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    readMovies: async (req, res, next) => {
        try {
            logEvents("Fetching all movies", "appLog.log");
            const movies = await Movie.find();
            if (movies.length == 0) return res.status(200).json([]);

            return res.status(200).json(movies);
        } catch (error) {
            console.log("Error!!", error);
        }
    },
    addMovie: async (req, res, next) => {
        try {
            logEvents("Fetching for movie " + req.body.movieId, "appLog.log");

            const { theatre, rating, movieId } = req.body;

            const response = await axios.get(`/movie/${movieId}`);
            const { original_title, genres } = response.data;

            logEvents("Adding movie " + req.params.movieId, "appLog.log");
            Movie.create({ movieId, title: original_title, theatre, rating, genres });

            return res.status(201).json("Created");
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    deleteMovie: async (req, res, next) => {
        try {
            logEvents("Movie Deleted " + req.params.movieId, "appLog.log");

            const { movieId } = req.params;
            const deletedMovie = await Movie.findOneAndDelete({ movieId });

            if (!deletedMovie) return res.status(200).json("Movie not found");
            return res.status(200).json("Deleted");
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    editRating: async (req, res, next) => {
        try {
            logEvents("Editing rating for  " + req.body.movieId, "appLog.log");
            const { movieId, rating } = req.body;

            const movie = await Movie.findOne({ movieId });
            if (!movie) return res.status(200).json("Movie not found");

            movie.rating = rating;
            movie.save();
            return res.status(200).json("Rating edited");
        } catch (error) {
            console.log("Error!!", error);
        }
    },
};

module.exports = movieController;
