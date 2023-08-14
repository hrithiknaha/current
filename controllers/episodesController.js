const User = require("../models/Users");

const { logEvents } = require("../middlewares/logger");

const episodesController = {
    getAllEpisodes: async (req, res, next) => {
        try {
            logEvents(`Fetching all episodes for ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.params.username }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series;
            let episodes = [];

            for (const show of series) for (const episode of show.episodes) episodes.push(episode);

            episodes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

            res.status(200).json(episodes);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = episodesController;
