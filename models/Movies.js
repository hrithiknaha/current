const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        movie_id: { type: Number, required: true },
        genres: { type: Array, required: true },
        runtime: { type: Number, required: true },
        theatre: { type: Boolean, required: true },
        rating: { type: Number, required: true },
        date_watched: { type: Date, required: true },
        release_date: { type: Date, required: true },
        production_countries: { type: [Object], required: true },
        production_companies: { type: [Object], required: true },
        spoken_languages: { type: [Object], required: true },
        casts: { type: [Object], required: true },
        crews: { type: [Object], required: true },
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
