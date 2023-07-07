const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        movie_id: { type: Number, required: true },
        theatre: { type: Boolean, required: true },
        rating: { type: Number, required: true },
        genres: { type: Array, required: true },
        date_watched: { type: Date, required: true },
        runtime: { type: Number, required: true },
        cast: { type: [Object], required: true },
        crew: { type: [Object], required: true },
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
