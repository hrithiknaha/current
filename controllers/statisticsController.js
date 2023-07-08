const User = require("../models/Users");

const { logEvents } = require("../middlewares/logger");

const statisticsController = {
    totalStats: async (req, res, next) => {
        logEvents(`Fetching stats of resource ${req.body.movie_id} for user ${req.user}`, "appLog.log");

        const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;

        let genreCount = {};
        let totalRuntime = 0;
        let totalRating = 0;

        for (const movie of movies) {
            for (const genre of movie.genres) {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            }
            totalRuntime += movie.runtime;
            totalRating += movie.rating;
        }

        const avgRating = totalRating / movies.length;

        return res.status(200).json({ genreCount, totalRuntime, avgRating });
    },
};

module.exports = statisticsController;
