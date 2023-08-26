const User = require("../models/Users");
const Movies = require("../models/Movies");

const { logEvents } = require("../middlewares/logger");
const Series = require("../models/Series");

const adminController = {
    getMovies: async (req, res, next) => {
        try {
            logEvents(`Admin fetching all movies`, "appLog.log");

            const movies = await Movies.find().lean();

            res.status(200).json(movies);
        } catch (error) {
            next(error);
        }
    },
    editMovie: async (req, res, next) => {
        try {
            logEvents(`Admin updating movie ${req.params.movieId}`, "appLog.log");

            const info = await Movies.updateMany({ movie_id: req.params.movieId }, req.body);

            res.status(201).json(info);
        } catch (error) {
            next(error);
        }
    },

    getSeries: async (req, res, next) => {
        try {
            logEvents(`Admin fetching all series`, "appLog.log");

            const series = await Series.find().lean();
            res.status(200).json(series);
        } catch (error) {
            next(error);
        }
    },
    editSeries: async (req, res, next) => {
        try {
            logEvents(`Admin updating series ${req.params.movieId}`, "appLog.log");

            const info = await Series.updateMany({ series_id: req.params.seriesId }, req.body);

            res.status(201).json(info);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = adminController;
