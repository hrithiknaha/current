const User = require("../models/Users");

const { logEvents } = require("../middlewares/logger");

const statisticsController = {
    totalMovieStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies for user ${req.user}`, "appLog.log");

            const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;

            let genreCount = {};
            let totalRuntime = 0;
            let totalRating = 0;
            let totalMovies = movies.length;

            for (const movie of movies) {
                for (const genre of movie.genres) {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                }
                totalRuntime += movie.runtime;
                totalRating += movie.rating;
            }

            const avgRating = totalRating / movies.length;

            return res.status(200).json({ genreCount, totalRuntime, avgRating, totalMovies });
        } catch (error) {
            next(error);
        }
    },

    totalSeriesStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of tv series for user ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series;

            let genreCount = {};
            let totalSeries = series.length;
            let totalEpisode = 0;
            let totalWatchedRuntime = 0;
            let totalWatchedRating = 0;

            for (const serie of series) {
                for (const genre of serie.genres) {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;

                    totalEpisode += serie.episodes.length;
                }
                for (const episode of serie.episodes) {
                    totalWatchedRuntime += episode.runtime;
                    totalWatchedRating += episode.rating;
                }
            }

            const avgRating = totalWatchedRating / totalEpisode;

            res.status(200).json({ genreCount, totalSeries, totalEpisode, avgRating, totalWatchedRuntime });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = statisticsController;
