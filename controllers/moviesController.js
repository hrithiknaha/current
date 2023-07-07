const axios = require("axios");

const searchAppender = require("../helpers/searchLodash");
const { logEvents } = require("../middlewares/logger");

const Movie = require("../models/Movies");

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
            const response = await axios.get(`/movie/${req.params.movieId}?append_to_response=credits`);

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
            const movie = await Movie.findOne({ movie_id: movieId });
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
            logEvents("Fetching for movie " + req.body.movie_id, "appLog.log");

            const { theatre, rating, movie_id, date_watched } = req.body;

            const response = await axios.get(`/movie/${movie_id}?append_to_response=credits`);
            const { original_title, genres, runtime, credits } = response.data;

            const casts = credits.cast;
            const topCast = casts
                .filter((cast) => cast.order < 5)
                .map((cast) => {
                    return {
                        id: cast.id,
                        name: cast.name,
                        character: cast.character,
                    };
                });

            const crews = credits.crew;
            const topCrew = crews
                .filter((crew) => crew.job === "Director" || crew.job === "Director of Photography" || crew.job === "Screenplay" || crew.job === "Story")
                .map((c) => {
                    return {
                        id: c.id,
                        name: c.name,
                        job: c.job,
                    };
                });

            Movie.create({ movie_id, title: original_title, theatre, rating, genres, date_watched, runtime, cast: topCast, crew: topCrew });

            logEvents("Adding movie " + movie_id, "appLog.log");
            return res.status(201).json("Created");
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    deleteMovie: async (req, res, next) => {
        try {
            logEvents("Movie Deleted " + req.params.movieId, "appLog.log");

            const { movieId } = req.params;
            const deletedMovie = await Movie.findOneAndDelete({ movie_id: movieId });

            if (!deletedMovie) return res.status(200).json("Movie not found");
            return res.status(200).json("Deleted");
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    editRating: async (req, res, next) => {
        try {
            logEvents("Editing rating for  " + req.body.movie_id, "appLog.log");
            const { movie_id, rating } = req.body;

            const movie = await Movie.findOne({ movie_id });
            if (!movie) return res.status(200).json("Movie not found");

            movie.rating = rating;
            movie.save();
            return res.status(200).json("Rating edited");
        } catch (error) {
            console.log("Error!!", error);
        }
    },

    editDateWatched: async (req, res, next) => {
        try {
            logEvents("Editing date watched for  " + req.body.movie_id, "appLog.log");
            const { movie_id, date_watched } = req.body;

            const movie = await Movie.findOne({ movie_id });
            if (!movie) return res.status(200).json("Movie not found");

            movie.date_watched = date_watched;
            movie.save();
            return res.status(200).json("Date watched edited");
        } catch (error) {
            console.log("Error!!", error);
        }
    },
};

module.exports = movieController;
