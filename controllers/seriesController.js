const axios = require("axios");

const { logEvents } = require("../middlewares/logger");
const Series = require("../models/Series");
const User = require("../models/Users");
const Episode = require("../models/Episodes");

const seriesController = {
    addSeries: async (req, res, next) => {
        try {
            logEvents(`Inserting resource ${req.body.series_id} for user ${req.user}`, "appLog.log");

            const { series_id } = req.body;

            const response = await axios.get(`/tv/${series_id}?append_to_response=credits`);

            const {
                name,
                genres,
                number_of_episodes,
                number_of_seasons,
                status,
                first_air_date,
                spoken_languages,
                networks,
                origin_country,
                production_companies,
                production_countries,
                episode_run_time,
            } = response.data;

            const user = await User.findOne({ username: req.user }).populate("series");

            const series = user.series;

            const duplicateSeries = series.filter((s) => s.series_id === parseInt(series_id));

            if (duplicateSeries.length != 0)
                return res.status(409).json({ success: true, status_message: "Series already has been added." });

            const genreName = genres.map((genre) => genre.name);

            const tv = await Series.create({
                series_id,
                episode_run_time: episode_run_time[0],
                name,
                genres: genreName,
                number_of_episodes,
                number_of_seasons,
                status,
                first_air_date,
                spoken_languages,
                networks,
                origin_country,
                production_companies,
                production_countries,
            });

            user.series.push(tv._id);
            user.save();

            return res.status(201).json({
                success: true,
                status_message: "The resources was inserted into database.",
                data: tv,
            });
        } catch (error) {
            next(error);
        }
    },

    showSeries: async (req, res, next) => {
        try {
            logEvents(`Fetching resource for user ${req.user}`, "appLog.log");

            let user = null;
            if (req.query?.episodes) {
                user = await User.findOne({ username: req.user }).populate({
                    path: "series",
                    populate: {
                        path: "episodes",
                    },
                });
            } else user = await User.findOne({ username: req.user }).populate("series");

            if (!user)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series) return res.status(200).json({});

            res.status(200).json(series);
        } catch (error) {
            next(error);
        }
    },

    showAllSeries: async (req, res, next) => {
        try {
            logEvents(`Fetching all resource for user ${req.user}`, "appLog.log");

            let user = null;
            if (req.query?.episodes) {
                user = await User.findOne({ username: req.params.username }).populate({
                    path: "series",
                    populate: {
                        path: "episodes",
                    },
                });
            } else user = await User.findOne({ username: req.params.username }).populate("series");

            if (!user)
                return res.status(200).json({
                    success: true,
                    status_message: "No user found for the token.",
                });

            const series = user.series;

            if (series.length === 0)
                return res.status(404).json({
                    success: true,
                    status_message: "No series found..",
                });

            res.status(200).json(series);
        } catch (error) {
            next(error);
        }
    },

    watchEpisode: async (req, res, next) => {
        try {
            logEvents(`Inserting resource for user ${req.user}`, "appLog.log");

            const { rating, date_watched, series_id, season_number, episode_number } = req.body;

            const response = await axios.get(
                `/tv/${series_id}/season/${season_number}/episode/${episode_number}?append_to_response=credits`
            );

            const { name, id, runtime, credits } = response.data;

            const { cast, crew, guest_stars } = credits;

            const topCast = cast.map((c) => {
                return {
                    id: c.id,
                    name: c.name,
                    character: c.character,
                };
            });

            const topCrew = crew
                .filter(
                    (c) =>
                        c.job === "Director" ||
                        c.job === "Producer" ||
                        c.job === "Screenplay" ||
                        c.job === "Director of Photography"
                )
                .map((c) => {
                    return { id: c.id, job: c.job, name: c.name };
                });

            const topGuestStar = guest_stars.map((g) => {
                return {
                    id: g.id,
                    name: g.name,
                    character: g.character,
                };
            });

            //Adding episode to series and that series to logged in user
            const user = await User.findOne({ username: req.user }).populate("series");

            if (!user)
                return res.status(404).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const allSeries = user.series;

            const relevant_series = allSeries.filter((s) => s.series_id === parseInt(series_id))[0];

            if (!relevant_series)
                return res.status(404).json({
                    success: false,
                    status_message: "Series not found. Add series to catalogue before rating episodes.",
                });

            //Handling logic to check if the episode has been rated already or not.
            const episodeSeries = await Series.findOne({
                series_id: relevant_series.series_id,
            }).populate("episodes");

            const allWatchedEpisodes = episodeSeries.episodes;

            const duplicateEpisdoe = allWatchedEpisodes.filter((e) => e.episode_id === id);

            if (duplicateEpisdoe.length != 0)
                return res.status(409).json({
                    success: false,
                    status_message: "The resources has already been rated.",
                });

            const watchedEpisode = await Episode.create({
                episode_id: id,
                series_id,
                name,
                season_number,
                episode_number,
                runtime,
                rating,
                date_watched,
                casts: topCast,
                crews: topCrew,
                guest_starts: topGuestStar,
            });

            episodeSeries.episodes.push(watchedEpisode._id);
            await episodeSeries.save();

            res.status(201).json({
                success: true,
                status_message: "The resources was rated and inserted successfully into database.",
            });
        } catch (error) {
            next(error);
        }
    },

    showWatchedEpisode: async (req, res, next) => {
        try {
            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: {
                    path: "episodes",
                },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series) return res.status(200).json({});

            const episode = series.episodes.filter((e) => e.episode_id === parseInt(req.params.episodeId))[0];

            if (!episode)
                return res.status(404).json({
                    success: false,
                    status_message: "No resource found for the given episode id.",
                });

            res.status(200).json(episode);
        } catch (error) {
            next(error);
        }
        logEvents(`Fetching episode watched by user ${req.user}`, "appLog.log");
    },

    showWatchedEpisodeOfSeason: async (req, res, next) => {
        try {
            logEvents(`Fetching all watched episodes for resource ${req.params.seriesId}`, "appLog.log");

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: {
                    path: "episodes",
                },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series) return res.status(200).json([]);
            const episodes = series.episodes.filter((e) => e.season_number === parseInt(req.params.seasonNumber));

            res.status(200).json(episodes);
        } catch (error) {
            next(error);
        }
    },

    showAllWatchedEpisode: async (req, res, next) => {
        try {
            logEvents(`Fetching all watched episodes for resource ${req.params.seriesId}`, "appLog.log");

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: {
                    path: "episodes",
                },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series) return res.status(200).json([]);
            const episodes = series.episodes;

            res.status(200).json(episodes);
        } catch (error) {
            next(error);
        }
    },

    editEpisodeRating: async (req, res, next) => {
        try {
            logEvents(`Editing rating of episodes for resource ${req.params.seriesId}`, "appLog.log");

            const { rating } = req.body;

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series)
                return res.status(200).json({
                    success: false,
                    status_message: "No resource found for the given series id.",
                });

            const episode = series.episodes.filter((e) => e.episode_id === parseInt(req.params.episodeId))[0];

            if (!episode)
                return res.status(200).json({
                    success: false,
                    status_message: "No resource found for the given episode id.",
                });

            await Episode.findByIdAndUpdate(episode._id, { rating }, { new: true });

            res.status(200).json({
                success: true,
                status_message: "Resource rating updated.",
            });
        } catch (error) {
            next(error);
        }
    },

    editEpisodeDateWatched: async (req, res, next) => {
        try {
            logEvents(`Editing date watched of episodes for resource ${req.params.seriesId}`, "appLog.log");

            const { date_watched } = req.body;

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series.filter((s) => s.series_id === parseInt(req.params.seriesId))[0];

            if (!series)
                return res.status(200).json({
                    success: false,
                    status_message: "No resource found for the given series id.",
                });

            const episode = series.episodes.filter((e) => e.episode_id === parseInt(req.params.episodeId))[0];

            if (!episode)
                return res.status(200).json({
                    success: false,
                    status_message: "No resource found for the given episode id.",
                });

            await Episode.findByIdAndUpdate(episode._id, { date_watched }, { new: true });

            res.status(200).json({
                success: true,
                status_message: "Resource date_watched updated.",
            });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = seriesController;
