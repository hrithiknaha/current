const axios = require("axios");

const { logEvents } = require("../middlewares/logger");

const getRedisClient = require("../configs/redisConfig");

const Movie = require("../models/Movies");
const User = require("../models/Users");

const movieController = {
    readMovie: async (req, res, next) => {
        try {
            logEvents(`Searching resource ${req.params.movieId} for user ${req.user}`, "appLog.log");

            const movies = (await User.findOne({ username: req.user }).populate("movies").exec()).movies;

            const movie = movies.filter((movie) => movie.movie_id === parseInt(req.params.movieId));

            if (movie.length === 0)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found.",
                    data: {},
                });

            return res.status(200).json(movie);
        } catch (error) {
            next(error);
        }
    },

    readMovies: async (req, res, next) => {
        try {
            logEvents(`Searching all resources for user ${req.user}`, "appLog.log");
            const user = await User.findOne({ username: req.params.username }).populate("movies").exec();

            if (!user)
                return res.status(404).json({
                    success: false,
                    status_message: "No user found. Request Unauthorized.",
                });

            const movies = user.movies;

            if (movies.length == 0)
                return res.status(404).json({
                    success: false,
                    status_message: "The resources you requested could not be found.",
                });

            return res.status(200).json(movies);
        } catch (error) {
            next(error);
        }
    },
    addMovie: async (req, res, next) => {
        try {
            logEvents(`Inserting resource ${req.body.movie_id} for user ${req.user}`, "appLog.log");

            const { rating, movie_id, date_watched } = req.body;

            const response = await axios.get(`/movie/${movie_id}?append_to_response=credits`);

            const {
                title,
                genres,
                runtime,
                credits,
                production_countries,
                spoken_languages,
                release_date,
                production_companies,
                poster_path,
            } = response.data;

            const genreName = genres.map((genre) => genre.name);

            const casts = credits.cast;
            const topCast = casts.map((cast) => {
                return {
                    id: cast.id,
                    name: cast.name,
                    character: cast.character,
                };
            });

            const crews = credits.crew;
            const topCrew = crews
                .filter(
                    (crew) =>
                        crew.job === "Director" ||
                        crew.job === "Director of Photography" ||
                        crew.job === "Screenplay" ||
                        crew.job === "Story" ||
                        crew.job === "Original Music Composer"
                )
                .map((c) => {
                    return {
                        id: c.id,
                        name: c.name,
                        job: c.job,
                    };
                });

            const user = await User.findOne({ username: req.user }).populate("movies");

            if (!user) return res.status(200).json({ success: true, status_message: "No User." });

            const movies = user.movies;

            const dulicateMovie = movies.filter((movie) => movie.movie_id === parseInt(movie_id));

            if (dulicateMovie.length != 0)
                return res.status(409).json({ success: true, status_message: "Movie already has been added." });

            const movie = await Movie.create({
                movie_id,
                title,
                rating,
                genres: genreName,
                date_watched,
                runtime,
                release_date,
                production_companies,
                spoken_languages,
                production_countries,
                casts: topCast,
                crews: topCrew,
                poster_path,
            });

            user.movies.push(movie._id);
            user.save();

            const client = getRedisClient();
            client.del(`${process.env.NODE_ENV}-user:${req.user}`);

            return res.status(201).json({
                success: true,
                status_message: "The resources was inserted into database.",
                data: movie,
            });
        } catch (error) {
            next(error);
        }
    },

    deleteMovie: async (req, res, next) => {
        try {
            logEvents(`Deleting resource ${req.params.movieId} for user ${req.user}`, "appLog.log");

            const deletedMovie = await Movie.findOneAndDelete({ movie_id: req.params.movieId });

            if (!deletedMovie)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found.",
                });

            await User.findOneAndUpdate({ username: req.user }, { $pull: { movies: deletedMovie._id } });

            return res.status(200).json({
                success: true,
                status_message: "The resource you requested was deleted from database.",
            });
        } catch (error) {
            next(error);
        }
    },

    editRating: async (req, res, next) => {
        try {
            logEvents(`Editing rating of resource ${req.body.movie_id} for user ${req.user}`, "appLog.log");

            const { movie_id, rating } = req.body;

            const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;
            let movie = movies.filter((movie) => movie.movie_id === parseInt(movie_id))[0];

            if (!movie)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found.",
                });

            await Movie.findOneAndUpdate({ movie_id }, { $set: { rating } });

            return res.status(200).json({
                success: true,
                status_message: "The resource was updated.",
            });
        } catch (error) {
            next(next);
        }
    },

    editDateWatched: async (req, res, next) => {
        try {
            logEvents(`Editing date_watched of resource ${req.body.movie_id} for user ${req.user}`, "appLog.log");

            const { movie_id, date_watched } = req.body;

            const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;
            let movie = movies.filter((movie) => movie.movie_id === parseInt(movie_id))[0];

            if (!movie)
                return res.status(404).json({
                    success: false,
                    status_message: "The resource you requested could not be found.",
                });

            await Movie.findOneAndUpdate({ movie_id }, { $set: { date_watched } });

            return res.status(200).json({
                success: true,
                status_message: "The resource was updated.",
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = movieController;
