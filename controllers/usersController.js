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
};

module.exports = usersController;
