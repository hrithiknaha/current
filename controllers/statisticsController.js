const Movies = require("../models/Movies");

const statisticsController = {
    totalStats: async (req, res, next) => {
        const movies = await Movies.find();

        let genreCount = {};
        let totalRuntime = 0;
        let totalRating = 0;

        for (const movie of movies) {
            // Count genre occurrences
            for (const genre of movie.genres) {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            }

            // Accumulate runtime and rating
            totalRuntime += movie.runtime;
            totalRating += movie.rating;
        }

        const avgRating = totalRating / movies.length;

        return res.status(200).json({ genreCount, totalRuntime, avgRating });
    },
};

module.exports = statisticsController;
