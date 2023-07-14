const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
    {
        episode_id: { type: Number, required: true },
        name: { type: String, required: true },
        season_number: { type: Number, required: true },
        episode_number: { type: Number, required: true },
        runtime: { type: Number, required: true },
        rating: { type: Number, required: true },
        date_watched: { type: Date, required: true },
        cast: { type: [Object], required: true },
        crew: { type: [Object], required: true },
        guest_starts: { type: [Object], required: true },
    },
    { timeseries: true, timestamps: true }
);

module.exports = mongoose.model("Episode", episodeSchema);
