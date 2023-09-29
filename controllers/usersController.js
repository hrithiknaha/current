const User = require("../models/Users");

const { logEvents } = require("../middlewares/logger");

const getRedisClient = require("../configs/redisConfig");

const usersController = {
    searchUsers: async (req, res, next) => {
        try {
            logEvents(`Fetching user details`, "appLog.log");

            const { username } = req.body;

            const user = await User.findOne({ username }).select("-password");

            if (!user) return res.status(200).json([]);

            res.status(200).json([user]);
        } catch (error) {
            next(error);
        }
    },
    getUserDetails: async (req, res, next) => {
        try {
            logEvents(`Fetching user ${req.params.username} details`, "appLog.log");

            const username = req.params.username;

            const client = getRedisClient();

            const userCache = await client.get(`user:${username}`);

            if (userCache) return res.status(200).json(JSON.parse(userCache));
            else {
                const user = await User.findOne({ username })
                    .select("-password")
                    .populate("movies")
                    .populate({ path: "series", populate: { path: "episodes" } })
                    .populate({ path: "followers", select: "username" })
                    .populate({ path: "following", select: "username" })
                    .lean();

                if (!user)
                    return res.status(404).json({
                        success: false,
                        status_message: "The user you requested could not be found.",
                        data: {},
                    });

                client.setEx(`user:${username}`, 3600, JSON.stringify(user));

                return res.status(200).json(user);
            }
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

            const response = {
                rating: movie[0].rating,
                date_watched: movie[0].date_watched,
                theatre: movie[0].theatre,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    },

    followUser: async (req, res, next) => {
        try {
            logEvents(`${req.user} requests to follow ${req.params.username}`, "appLog.log");

            const userToFollow = await User.findOne({ username: req.params.username });
            const user = await User.findOne({ username: req.user }).populate("following");

            if (!userToFollow)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the request. Cant send request",
                });

            if (!user)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the request.",
                });

            const alreadyFollowing = user.following.filter((user) => user.username === req.params.username)[0];

            if (alreadyFollowing)
                return res.status(409).json({
                    success: true,
                    status_message: "User already following.",
                });

            user.following.push(userToFollow._id);
            userToFollow.followers.push(user._id);

            await userToFollow.save();
            await user.save();

            res.status(200).json({ success: true, message: "User followed" });
        } catch (error) {
            next(error);
        }
    },

    removeUser: async (req, res, next) => {
        try {
            logEvents(`${req.user} requests to remove ${req.params.username}`, "appLog.log");

            const userToRemove = await User.findOne({ username: req.params.username }).populate({
                path: "followers",
                select: "username",
            });
            const user = await User.findOne({ username: req.user }).populate({ path: "following", select: "username" });

            if (!userToRemove)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the request. Cant send request",
                });

            if (!user)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the request.",
                });

            const isFollowing = user.following.filter((user) => user.username === req.params.username)[0];

            if (!isFollowing)
                return res.status(200).json({
                    success: true,
                    status_message: "No user to unfollow.",
                });

            user.following = user.following.filter((user) => user.username != req.params.username);
            await user.save();

            userToRemove.followers = userToRemove.followers.filter((user) => user.username != req.user);
            await userToRemove.save();

            res.status(200).json({ success: true, message: "User unfollowed" });
        } catch (error) {
            next(error);
        }
    },

    getFriends: async (req, res, next) => {
        try {
            logEvents(`${req.user} requests friends details`, "appLog.log");

            const user = await User.findOne({ username: req.params.username })
                .select("followers following")
                .populate({ path: "followers", select: "username" })
                .populate({ path: "following", select: "username" });

            if (!user)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the request.",
                });

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = usersController;
