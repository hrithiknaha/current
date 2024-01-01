const User = require("../models/Users");

const getRedisClient = require("../configs/redisConfig");

const { logEvents } = require("../middlewares/logger");
const { axiosPublicInstance } = require("../configs/axios");

const episodesController = {
    getAllEpisodes: async (req, res, next) => {
        try {
            logEvents(`Fetching all episodes for ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.params.username }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series;
            let episodes = [];

            for (const show of series) for (const episode of show.episodes) episodes.push(episode);

            episodes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

            res.status(200).json(episodes);
        } catch (error) {
            next(error);
        }
    },

    getNextEpisode: async (req, res, next) => {
        try {
            logEvents(`Fetching next episodes for ${req.user}`, "appLog.log");

            const client = getRedisClient();

            let seriesIdCacheArray = await client.lRange(`${process.env.NODE_ENV}-user:${req.user}-seriesId`, 0, -1); // Get all seriesIds without altering the list

            // if seriesId array has data, get the series details for each seriesId
            if (seriesIdCacheArray.length > 0) {
                let data = [];

                for (const seriesId of seriesIdCacheArray) {
                    const seriesData = await client.get(seriesId);

                    if (seriesData) {
                        data.push(JSON.parse(seriesData));
                    }
                }

                data.sort((a, b) => (a.show.updatedAt < b.show.updatedAt ? 1 : -1));

                return res.status(200).json(data);
            } else {
                // if seriesId array is empty, follow the normal route
                const user = await User.findOne({ username: req.params.username }).populate({
                    path: "series",
                    populate: { path: "episodes" },
                });

                if (!user) {
                    return res.status(200).json({
                        success: false,
                        status_message: "No user found for the token.",
                    });
                }

                const series = user.series;

                // Calculate the date one month ago from the current date
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                // Filter the array to get objects with 'updatedAt' not older than one month
                const filteredSeriesWatchedWithinOneMonth = series.filter((item) => {
                    const updatedAtDate = new Date(item.updatedAt);
                    return updatedAtDate >= oneMonthAgo;
                });

                const promises = filteredSeriesWatchedWithinOneMonth.map(async (show) => {
                    const series_id = show.series_id;
                    const cacheKey = `user:${req.user}-series:${series_id}`;

                    // Add seriesId to the list
                    await client.rPush(`${process.env.NODE_ENV}-user:${req.user}-seriesId`, cacheKey);
                    await client.expire(`${process.env.NODE_ENV}-user:${req.user}-seriesId`, 3600);

                    let seasonNumber = 1;
                    let episodeNumber = 0;

                    if (show.episodes.length > 0) {
                        seasonNumber = show.episodes[show.episodes?.length - 1].season_number;
                        episodeNumber = show.episodes[show.episodes?.length - 1].episode_number;
                    }

                    if (show.number_of_episodes === show.episodes.length) return null;

                    return axiosPublicInstance
                        .get(`/api/tmdb/series/${series_id}`)
                        .then((response) => {
                            const seriesDetails = response.data;

                            //total seasons
                            const totalSeasons = seriesDetails.number_of_seasons;

                            //Next Episode?
                            const currentSeason = seriesDetails.seasons.find(
                                (season) => season.season_number === seasonNumber
                            );

                            if (seasonNumber <= totalSeasons) {
                                if (episodeNumber < currentSeason.episode_count) episodeNumber += 1;
                                else if (episodeNumber === currentSeason.episode_count) {
                                    episodeNumber = 1;
                                    seasonNumber += 1;
                                }

                                const nextEpisode = {
                                    season_number: seasonNumber,
                                    episode_number: episodeNumber,
                                };

                                const dataToCache = { seriesDetails, nextEpisode, show };

                                client.setEx(cacheKey, 3600, JSON.stringify(dataToCache));

                                return { seriesDetails, nextEpisode, show };
                            } else {
                                return null; // Return null for cases where there is no next episode
                            }
                        })
                        .catch((error) => {
                            console.error(error); // Handle errors for individual Axios requests locally
                            return null; // Return null for failed requests
                        });
                });

                Promise.all(promises.filter(Boolean)) // Filter out null values from the promises array
                    .then((results) => {
                        const validResult = results
                            .filter((r) => r !== null)
                            .sort((a, b) => (a.show.updatedAt < b.show.updatedAt ? 1 : -1));
                        res.status(200).json(validResult);
                    })
                    .catch((error) => {
                        console.error(error);
                        next(error);
                    });
            }
        } catch (error) {
            next(error);
        }
    },
};

module.exports = episodesController;
