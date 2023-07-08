const Movies = require("../models/Movies");

const statisticsController = {
    totalStats: async (req, res, next) => {
        const movies = await Movies.find();

        const genres = movies
            .map((movie) => movie.genres)
            .flat()
            .reduce((countMap, genre) => {
                countMap[genre] = (countMap[genre] || 0) + 1;
                return countMap;
            }, {});
        const runtimes = movies.map((movie) => movie.runtime).reduce((a, c) => a + c);
        const ratings = movies.map((movie) => movie.rating).reduce((a, c) => a + c) / movies.length;

        return res.status(200).json({ genres, runtimes, ratings });
    },
};

module.exports = statisticsController;
