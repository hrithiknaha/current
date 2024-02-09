const User = require("../models/Users");

const fetchUserMovies = async (username) => {
    const user = await User.findOne({ username }).select("-password").populate("movies").lean();

    const movies = user.movies;

    return movies;
};

const fetchUserShows = async (username) => {
    const user = await User.findOne({ username }).select("-password").populate("series").lean();

    const shows = user.series;

    return shows;
};

const fetchUserShowsAndEpisodes = async (username) => {
    const user = await User.findOne({ username })
        .select("-password")
        .populate({ path: "series", populate: { path: "episodes" } })
        .lean();

    const shows = user.series;

    return shows;
};

module.exports = { fetchUserMovies, fetchUserShows, fetchUserShowsAndEpisodes };
