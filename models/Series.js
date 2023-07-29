const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        episode_run_time: { type: Number, required: false },
        series_id: { type: Number, required: true },
        genres: { type: Array, required: true },
        number_of_seasons: { type: Number, required: true },
        number_of_episodes: { type: Number, required: true },
        status: { type: String, required: true },
        episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
        first_air_date: { type: String, required: true },
        spoken_languages: { type: [Object], required: true },
        networks: { type: [Object], required: true },
        origin_country: { type: [Object], required: true },
        production_companies: { type: [Object], required: true },
        production_countries: { type: [Object], required: true },
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
