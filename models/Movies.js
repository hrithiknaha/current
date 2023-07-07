const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        movieId: { type: Number, required: true },
        theatre: { type: Boolean, required: true },
        rating: { type: Number, required: true },
        genres: { type: Array, required: true },
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
