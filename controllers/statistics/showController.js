const moment = require("moment");

const { fetchUserShows, fetchUserShowsAndEpisodes } = require("../../services/userServices");

const showController = {
    getShowGenreStats: async (req, res, next) => {
        try {
            const genre = String(req.params.genre);

            const shows = await fetchUserShows(req.user);

            const filteredShow = shows.filter((show) => {
                return show.genres.includes(genre);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowStatusStats: async (req, res, next) => {
        try {
            const status = String(req.params.status);

            const shows = await fetchUserShows(req.user);

            const filteredShow = shows.filter((show) => {
                return show.status === status;
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowLanguageStats: async (req, res, next) => {
        try {
            const language = String(req.params.language);

            const shows = await fetchUserShows(req.user);

            const filteredShow = shows.filter((show) => {
                return show.spoken_languages.some((lang) => lang.english_name === language);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowOriginCountryStats: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const shows = await fetchUserShows(req.user);

            const filteredShow = shows.filter((show) => {
                return show.origin_country.some((coun) => coun === country);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowProductionCountryStats: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const shows = await fetchUserShows(req.user);

            const filteredShow = shows.filter((show) => {
                return show.production_countries.some((coun) => coun.name === country);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowLastTwentyWeekStats: async (req, res, next) => {
        try {
            const weekNumber = Number(req.params.week);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = [];

            shows.map((show) => {
                const filteredEpisodes = show.episodes.filter((episode) => {
                    return moment(episode.date_watched).utc().utcOffset("+05:30").week() === weekNumber;
                });

                const {
                    genres,
                    spoken_languages,
                    networks,
                    origin_country,
                    production_companies,
                    production_countries,
                    ...showInfo
                } = show;

                if (filteredEpisodes.length > 0) {
                    const filteredSeries = {
                        ...showInfo,
                        episodes: filteredEpisodes.map(({ casts, crews, guest_starts, ...episodeInfo }) => episodeInfo),
                    };

                    seriesWithFilteredEpisodes.push(filteredSeries);
                }
            });
            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowHourOfDayStats: async (req, res, next) => {
        try {
            const hour = Number(req.params.hour);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = [];

            shows.map((show) => {
                const filteredEpisodes = show.episodes.filter((episode) => {
                    return moment(episode.date_watched).utc().utcOffset("+05:30").hour() === hour;
                });

                const {
                    genres,
                    spoken_languages,
                    networks,
                    origin_country,
                    production_companies,
                    production_countries,
                    ...showInfo
                } = show;

                if (filteredEpisodes.length > 0) {
                    const filteredSeries = {
                        ...showInfo,
                        episodes: filteredEpisodes.map(({ casts, crews, guest_starts, ...episodeInfo }) => episodeInfo),
                    };

                    seriesWithFilteredEpisodes.push(filteredSeries);
                }
            });
            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowDayOfWeekStats: async (req, res, next) => {
        try {
            const day = Number(req.params.day);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = [];

            shows.map((show) => {
                const filteredEpisodes = show.episodes.filter((episode) => {
                    return moment(episode.date_watched).utc().utcOffset("+05:30").weekday() === day;
                });

                const {
                    genres,
                    spoken_languages,
                    networks,
                    origin_country,
                    production_companies,
                    production_countries,
                    ...showInfo
                } = show;

                if (filteredEpisodes.length > 0) {
                    const filteredSeries = {
                        ...showInfo,
                        episodes: filteredEpisodes.map(({ casts, crews, guest_starts, ...episodeInfo }) => episodeInfo),
                    };

                    seriesWithFilteredEpisodes.push(filteredSeries);
                }
            });
            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowMonthStats: async (req, res, next) => {
        try {
            const month = Number(req.params.month);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = [];

            shows.map((show) => {
                const filteredEpisodes = show.episodes.filter((episode) => {
                    return moment(episode.date_watched).utc().utcOffset("+05:30").month() === month;
                });

                const {
                    genres,
                    spoken_languages,
                    networks,
                    origin_country,
                    production_companies,
                    production_countries,
                    ...showInfo
                } = show;

                if (filteredEpisodes.length > 0) {
                    const filteredSeries = {
                        ...showInfo,
                        episodes: filteredEpisodes.map(({ casts, crews, guest_starts, ...episodeInfo }) => episodeInfo),
                    };

                    seriesWithFilteredEpisodes.push(filteredSeries);
                }
            });
            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowYearStats: async (req, res, next) => {
        try {
            const year = Number(req.params.year);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return moment(show.first_air_date).utc().utcOffset("+05:30").year() == year;
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowProductionCompanyStats: async (req, res, next) => {
        try {
            const company = String(req.params.company);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return show.production_companies.some((prod) => prod.name === company);
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowNetworkStats: async (req, res, next) => {
        try {
            const network = String(req.params.network);

            const shows = await fetchUserShowsAndEpisodes(req.user);

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return show.networks.some((prod) => prod.name === network);
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = showController;
