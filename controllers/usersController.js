const User = require("../models/Users");

const { logEvents } = require("../middlewares/logger");

const usersController = {
    getUserDetails: async (req, res, next) => {
        try {
            logEvents(`Fetching user ${req.params.username} details`, "appLog.log");

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies").lean();
            console.log(user);

            if (!user)
                return res.status(404).json({
                    success: false,
                    status_message: "The user you requested could not be found.",
                    data: {},
                });

            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },

    userAddedMovie: async (req, res, next) => {
        try {
            logEvents(`Fetching if user ${req.user} has added the requested movie`, "appLog.log");

            const user = await User.findOne({ username: req.user }).populate("movies").lean();

            if (!user)
                return res.status(404).json({
                    success: false,
                    status_message: "No user found for the request.",
                    data: {},
                });

            const movie = user.movies.filter((movie) => movie.movie_id === parseInt(req.params.movieId));

            if (movie.length === 0)
                return res.status(404).json({
                    success: false,
                    status_message: "Movie not found for user.",
                    data: {},
                });

            return res.status(200).json(movie);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = usersController;
