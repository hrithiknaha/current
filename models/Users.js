const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true },
        movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
        series: [{ type: mongoose.Schema.Types.ObjectId, ref: "Series" }],
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
