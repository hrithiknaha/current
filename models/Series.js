const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        series_id: { type: Number, required: true },
        genres: { type: Array, required: true },
        number_of_seasons: { type: Number, required: true },
        number_of_episodes: { type: Number, required: true },
        status: { type: String, required: true },
        episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
