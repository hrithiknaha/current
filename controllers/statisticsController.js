const User = require("../models/Users");
const moment = require("moment");

const { logEvents } = require("../middlewares/logger");

const { getWeekday, getMonth, getHourAsAMPM } = require("../helpers/utils");

const statisticsController = {
    totalStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies and tv series for user ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.params.username })
                .populate({ path: "series", populate: { path: "episodes" } })
                .populate("movies");

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series;
            const movies = user.movies;

            // Series stats
            let genreSeriesDataset = [];
            let releaseYearSeriesDataset = [];
            let languageSeriesDataset = [];
            let networkSeriesDataset = [];
            let originCountrySeriesDataset = [];
            let productionCompaniesSeriesDataset = [];
            let productionCountriesSeriesDataset = [];
            let statusSeriesDataset = [];
            let castEpisodeDataset = [];
            let totalSeries = series.length;
            let totalEpisode = 0;
            let totalWatchedRuntime = 0;
            let totalWatchedRating = 0;
            let totalWatchedToday = 0;
            let totalWatchedThisWeek = 0;
            let totalWatchedThisMonth = 0;
            let totalWatchedThisYear = 0;
            let lastTwentyWeekWatchedDataset = [];
            let weekdaySeriesDataset = [];
            let monthSeriesDataset = [];
            let hourOfDaySeriesDataset = [];
            let seriesEpisodesDataset = [];

            const genreSeriesMap = new Map();
            const releaseYearSeriesMap = new Map();
            const languageSeriesMap = new Map();
            const networkSeriesMap = new Map();
            const originCountrySeriesMap = new Map();
            const productionCompaniesSeriesMap = new Map();
            const productionCountriesSeriesMap = new Map();
            const statusSeriesMap = new Map();
            const twentyWeekMap = new Map();
            const weekdayMap = new Map();
            const monthMap = new Map();
            const hourMap = new Map();
            const seriesEpisodesMap = new Map();
            const castSeriesMap = new Map();

            /**
             * * 20 weeks view from current week
             */
            const twentyWeeksAgoUnix = moment().subtract(20, "weeks").unix();
            let currentWeek = moment().week();
            for (let i = 0; i < 20; i++) {
                twentyWeekMap.set(currentWeek, 0);
                currentWeek = currentWeek === 1 ? 52 : currentWeek - 1;
            }

            /**
             * * Setting All Months
             */
            for (let i = 0; i < 12; i++) {
                monthMap.set(i, 0);
            }

            /**
             * * Setting All Hours
             */
            for (let i = 0; i < 24; i++) {
                hourMap.set(i, 0);
            }

            for (const serie of series) {
                for (const episode of serie.episodes.filter(
                    (e) => moment(e.date_watched).utc().utcOffset("+05:30").year() === moment().year()
                )) {
                    if (
                        moment(episode.date_watched).utc().utcOffset("+05:30").format("YYYY-MM-DD") ===
                        moment().utc().utcOffset("+05:30").format("YYYY-MM-DD")
                    )
                        totalWatchedToday++;
                    if (moment(episode.date_watched).utc().utcOffset("+05:30").week() === moment().week())
                        totalWatchedThisWeek++;
                    if (moment(episode.date_watched).utc().utcOffset("+05:30").month() === moment().month())
                        totalWatchedThisMonth++;
                    if (moment(episode.date_watched).utc().utcOffset("+05:30").year() === moment().year())
                        totalWatchedThisYear++;
                }

                for (const genre of serie.genres) {
                    genreSeriesMap.set(genre, (genreSeriesMap.get(genre) || 0) + 1);
                }

                for (const language of serie.spoken_languages) {
                    languageSeriesMap.set(
                        language.english_name,
                        (languageSeriesMap.get(language.english_name) || 0) + 1
                    );
                }

                for (const network of serie.networks) {
                    networkSeriesMap.set(network.name, (networkSeriesMap.get(network.name) || 0) + 1);
                }

                for (const country of serie.origin_country) {
                    originCountrySeriesMap.set(country, (originCountrySeriesMap.get(country) || 0) + 1);
                }

                for (const country of serie.production_countries) {
                    productionCountriesSeriesMap.set(
                        country.name,
                        (productionCountriesSeriesMap.get(country.name) || 0) + 1
                    );
                }

                for (const company of serie.production_companies) {
                    productionCompaniesSeriesMap.set(
                        company.name,
                        (productionCompaniesSeriesMap.get(company.name) || 0) + 1
                    );
                }

                for (const episode of serie.episodes) {
                    totalWatchedRuntime += episode.runtime;
                    totalWatchedRating += episode.rating;

                    const weekUnix = moment(episode.date_watched).utc().utcOffset("+05:30").unix();
                    const weekNumber = moment(episode.date_watched).utc().utcOffset("+05:30").week();
                    if (weekUnix >= twentyWeeksAgoUnix) {
                        twentyWeekMap.set(weekNumber, (twentyWeekMap.get(weekNumber) || 0) + 1);
                    }

                    const day = moment(episode.date_watched).utc().utcOffset("+05:30").day();
                    weekdayMap.set(day, (weekdayMap.get(day) || 0) + 1);

                    const month = moment(episode.date_watched).utc().utcOffset("+05:30").month();
                    monthMap.set(month, (monthMap.get(month) || 0) + 1);

                    const hour = moment(episode.date_watched).utc().utcOffset("+05:30").hour();
                    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);

                    for (const cast of episode.casts) {
                        castSeriesMap.set(cast.character, (castSeriesMap.get(cast.character) || 0) + 1);
                    }
                }

                const seriesYear = moment(serie.first_air_date).year();
                releaseYearSeriesMap.set(seriesYear, (releaseYearSeriesMap.has(seriesYear) || 0) + 1);

                statusSeriesMap.set(serie.status, (statusSeriesMap.get(serie.status) || 0) + 1);

                seriesEpisodesMap.set(serie.name, serie.episodes.length);
                totalEpisode += serie.episodes.length;
            }

            seriesEpisodesDataset = Array.from(seriesEpisodesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            hourOfDaySeriesDataset = Array.from(hourMap, ([name, count]) => ({
                name,
                hour: getHourAsAMPM(name),
                count,
            })).sort((a, b) => (a.name > b.name ? 1 : -1));

            monthSeriesDataset = Array.from(monthMap, ([name, count]) => ({ name, month: getMonth(name), count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );

            weekdaySeriesDataset = Array.from(weekdayMap, ([name, count]) => ({
                name,
                day: getWeekday(name),
                count,
            })).sort((a, b) => (a.name > b.name ? 1 : -1));

            castEpisodeDataset = Array.from(castSeriesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            lastTwentyWeekWatchedDataset = Array.from(twentyWeekMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );

            genreSeriesDataset = Array.from(genreSeriesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );
            releaseYearSeriesDataset = Array.from(releaseYearSeriesMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );
            languageSeriesDataset = Array.from(languageSeriesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            networkSeriesDataset = Array.from(networkSeriesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            originCountrySeriesDataset = Array.from(originCountrySeriesMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.count < b.count ? 1 : -1)
            );

            productionCountriesSeriesDataset = Array.from(productionCountriesSeriesMap, ([name, count]) => ({
                name,
                count,
            })).sort((a, b) => (a.count < b.count ? 1 : -1));

            productionCompaniesSeriesDataset = Array.from(productionCompaniesSeriesMap, ([name, count]) => ({
                name,
                count,
            })).sort((a, b) => (a.count < b.count ? 1 : -1));

            statusSeriesDataset = Array.from(statusSeriesMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            const avgRatingSeries = totalWatchedRating / totalEpisode;

            // Movies stats
            let genreMovieDataset = [];
            let languageMovieDataset = [];
            let productionCountriesMovieDataset = [];
            let productionCompaniesMovieDataset = [];
            let releaseYearMovieDataset = [];
            let castMovieDataset = [];
            let directorMovieDataset = [];
            let totalRuntimeMovie = 0;
            let totalRatingMovie = 0;
            let totalMovies = movies.length;
            let totalWatchedMoviesToday = 0;
            let totalWatchedMoviesThisWeek = 0;
            let totalWatchedMoviesThisMonth = 0;
            let totalWatchedMoviesThisYear = 0;
            let lastTwentyWeekMoviesDataset = [];
            let weekdayMoviesDataset = [];
            let monthMoviesDataset = [];
            let hourOfDayMoviesDataset = [];

            const genreMovieMap = new Map();
            const languageMovieMap = new Map();
            const productionCountriesMovieMap = new Map();
            const productionCompaniesMovieMap = new Map();
            const releaseYearMovieMap = new Map();
            const castMovieMap = new Map();
            const directorMovieMap = new Map();
            const twentyWeekMovieMap = new Map();
            const weekMovieMap = new Map();
            const monthMovieMap = new Map();
            const hourOfDayMovieMap = new Map();

            /**
             * * Setting All weekday for movies
             */
            for (let i = 0; i < 7; i++) {
                weekMovieMap.set(i, 0);
            }

            /**
             * * Setting All Months for movies
             */
            for (let i = 0; i < 12; i++) {
                monthMovieMap.set(i, 0);
            }

            /**
             * * Setting All Hours for movies
             */
            for (let i = 0; i < 24; i++) {
                hourOfDayMovieMap.set(i, 0);
            }

            /**
             * * 20 weeks view from current week for movies
             */
            const twentyWeeksMoviesAgoUnix = moment().subtract(20, "weeks").unix();
            let currentWeekMovies = moment().week();

            for (let i = 0; i < 20; i++) {
                twentyWeekMovieMap.set(currentWeekMovies, 0);
                currentWeekMovies = currentWeekMovies === 1 ? 52 : currentWeekMovies - 1;
            }

            for (const movie of movies.filter(
                (e) => moment(e.date_watched).utc().utcOffset("+05:30").year() === moment().year()
            )) {
                if (
                    moment(movie.date_watched).utc().utcOffset("+05:30").format("YYYY-MM-DD") ===
                    moment().utc().utcOffset("+05:30").format("YYYY-MM-DD")
                )
                    totalWatchedMoviesToday++;
                if (moment(movie.date_watched).utc().utcOffset("+05:30").week() === moment().week())
                    totalWatchedMoviesThisWeek++;
                if (moment(movie.date_watched).utc().utcOffset("+05:30").month() === moment().month())
                    totalWatchedMoviesThisMonth++;
                if (moment(movie.date_watched).utc().utcOffset("+05:30").year() === moment().year())
                    totalWatchedMoviesThisYear++;
            }

            for (const movie of movies) {
                const day = moment(movie.date_watched).utc().utcOffset("+05:30").day();
                weekMovieMap.set(day, (weekMovieMap.get(day) || 0) + 1);

                const month = moment(movie.date_watched).utc().utcOffset("+05:30").month();
                monthMovieMap.set(month, (monthMovieMap.get(month) || 0) + 1);

                const hour = moment(movie.date_watched).utc().utcOffset("+05:30").hour();
                hourOfDayMovieMap.set(hour, (hourOfDayMovieMap.get(hour) || 0) + 1);

                const weekNumberUnix = moment(movie.date_watched).utc().utcOffset("+05:30").unix();
                const weekNumber = moment(movie.date_watched).utc().utcOffset("+05:30").week();
                if (weekNumberUnix >= twentyWeeksMoviesAgoUnix) {
                    twentyWeekMovieMap.set(weekNumber, (twentyWeekMovieMap.get(weekNumber) || 0) + 1);
                }

                for (const genre of movie.genres) {
                    genreMovieMap.set(genre, (genreMovieMap.get(genre) || 0) + 1);
                }

                for (const language of movie.spoken_languages) {
                    languageMovieMap.set(language.english_name, (languageMovieMap.get(language.english_name) || 0) + 1);
                }

                for (const country of movie.production_countries) {
                    productionCountriesMovieMap.set(
                        country.name,
                        (productionCountriesMovieMap.get(country.name) || 0) + 1
                    );
                }

                for (const company of movie.production_companies) {
                    productionCompaniesMovieMap.set(
                        company.name,
                        (productionCompaniesMovieMap.get(company.name) || 0) + 1
                    );
                }

                for (const cast of movie.casts) {
                    castMovieMap.set(cast.name, (castMovieMap.get(cast.name) || 0) + 1);
                }

                const directors = movie.crews.filter((c) => c.job === "Director");
                directors.forEach((director) => {
                    directorMovieMap.set(director.name, (directorMovieMap.get(director.name) || 0) + 1);
                });

                if (releaseYearMovieMap.has(moment(movie.release_date).year())) {
                    releaseYearMovieMap.set(
                        moment(movie.release_date).year(),
                        releaseYearMovieMap.get(moment(movie.release_date).year()) + 1
                    );
                } else {
                    releaseYearMovieMap.set(moment(movie.release_date).year(), 1);
                }

                totalRuntimeMovie += movie.runtime;
                totalRatingMovie += movie.rating;
            }
            weekdayMoviesDataset = Array.from(weekMovieMap, ([name, count]) => ({
                name,
                day: getWeekday(name),
                count,
            })).sort((a, b) => (a.name > b.name ? 1 : -1));

            monthMoviesDataset = Array.from(monthMovieMap, ([name, count]) => ({
                name,
                month: getMonth(name),
                count,
            })).sort((a, b) => (a.name > b.name ? 1 : -1));

            hourOfDayMoviesDataset = Array.from(hourOfDayMovieMap, ([name, count]) => ({
                name,
                hour: getHourAsAMPM(name),
                count,
            })).sort((a, b) => (a.name > b.name ? 1 : -1));

            lastTwentyWeekMoviesDataset = Array.from(twentyWeekMovieMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );

            genreMovieDataset = Array.from(genreMovieMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            releaseYearMovieDataset = Array.from(releaseYearMovieMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );

            languageMovieDataset = Array.from(languageMovieMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            productionCountriesMovieDataset = Array.from(productionCountriesMovieMap, ([name, count]) => ({
                name,
                count,
            })).sort((a, b) => (a.count < b.count ? 1 : -1));

            productionCompaniesMovieDataset = Array.from(productionCompaniesMovieMap, ([name, count]) => ({
                name,
                count,
            })).sort((a, b) => (a.count < b.count ? 1 : -1));

            castMovieDataset = Array.from(castMovieMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            directorMovieDataset = Array.from(directorMovieMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.count < b.count ? 1 : -1
            );

            const avgRatingMovie = totalRatingMovie / totalMovies;

            return res.status(200).json({
                // Series stats

                series: {
                    genreSeriesDataset,
                    totalSeries,
                    totalEpisode,
                    avgRatingSeries,
                    totalWatchedRuntime,
                    releaseYearSeriesDataset,
                    languageSeriesDataset,
                    networkSeriesDataset,
                    originCountrySeriesDataset,
                    productionCompaniesSeriesDataset,
                    productionCountriesSeriesDataset,
                    statusSeriesDataset,
                    totalWatchedToday,
                    totalWatchedThisWeek,
                    totalWatchedThisMonth,
                    totalWatchedThisYear,
                    lastTwentyWeekWatchedDataset,
                    weekdaySeriesDataset,
                    monthSeriesDataset,
                    hourOfDaySeriesDataset,
                    seriesEpisodesDataset,
                    castEpisodeDataset,
                },
                movies: {
                    // Movies stats
                    genreMovieDataset,
                    totalRuntimeMovie,
                    avgRatingMovie,
                    totalMovies,
                    languageMovieDataset,
                    productionCompaniesMovieDataset,
                    productionCountriesMovieDataset,
                    releaseYearMovieDataset,
                    castMovieDataset,
                    directorMovieDataset,
                    totalWatchedMoviesToday,
                    totalWatchedMoviesThisWeek,
                    totalWatchedMoviesThisMonth,
                    totalWatchedMoviesThisYear,
                    lastTwentyWeekMoviesDataset,
                    weekdayMoviesDataset,
                    monthMoviesDataset,
                    hourOfDayMoviesDataset,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    totalMovieStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies for user ${req.user}`, "appLog.log");

            const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;

            let totalRuntime = 0;
            let totalRating = 0;
            let totalMovies = movies.length;

            const genreMap = new Map();
            const languageMap = new Map();
            const productionCountriesMap = new Map();
            const productionCompaniesMap = new Map();
            const releaseYearMap = new Map();
            const castMap = new Map();
            const directorMap = new Map();

            movies.forEach((movie) => {
                movie.genres.forEach((genre) => {
                    genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
                });

                movie.spoken_languages.forEach((language) => {
                    languageMap.set(language.english_name, (languageMap.get(language.english_name) || 0) + 1);
                });

                movie.production_countries.forEach((country) => {
                    productionCountriesMap.set(country.name, (productionCountriesMap.get(country.name) || 0) + 1);
                });

                movie.production_companies.forEach((company) => {
                    productionCompaniesMap.set(company.name, (productionCompaniesMap.get(company.name) || 0) + 1);
                });

                movie.casts.forEach((cast) => {
                    castMap.set(cast.name, (castMap.get(cast.name) || 0) + 1);
                });

                const directors = movie.crews.filter((c) => c.job === "Director");
                directors.forEach((director) => {
                    directorMap.set(director.name, (directorMap.get(director.name) || 0) + 1);
                });

                if (releaseYearMap.has(moment(movie.release_date).year())) {
                    releaseYearMap.set(
                        moment(movie.release_date).year(),
                        releaseYearMap.get(moment(movie.release_date).year()) + 1
                    );
                } else {
                    releaseYearMap.set(moment(movie.release_date).year(), 1);
                }

                totalRuntime += movie.runtime;
                totalRating += movie.rating;
            });

            const genreDataset = Array.from(genreMap, ([name, count]) => ({ name, count }));
            const languageDataset = Array.from(languageMap, ([name, count]) => ({ name, count }));
            const productionCountriesDataset = Array.from(productionCountriesMap, ([name, count]) => ({ name, count }));
            const productionCompaniesDataset = Array.from(productionCompaniesMap, ([name, count]) => ({ name, count }));
            const releaseYearDataset = Array.from(releaseYearMap, ([name, count]) => ({ name, count })).sort((a, b) =>
                a.name > b.name ? 1 : -1
            );
            const castDataset = Array.from(castMap, ([name, count]) => ({ name, count }));
            const directorDataset = Array.from(directorMap, ([name, count]) => ({ name, count }));

            const avgRating = totalRating / totalMovies;

            return res.status(200).json({
                totalRuntime,
                avgRating,
                totalMovies,
                genreDataset,
                languageDataset,
                productionCompaniesDataset,
                productionCountriesDataset,
                releaseYearDataset,
                castDataset,
                directorDataset,
            });
        } catch (error) {
            next(error);
        }
    },

    totalSeriesStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of tv series for user ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.user }).populate({
                path: "series",
                populate: { path: "episodes" },
            });

            if (!user)
                return res.status(200).json({
                    success: false,
                    status_message: "No user found for the token.",
                });

            const series = user.series;

            let totalEpisode = 0;
            let totalWatchedRuntime = 0;
            let totalWatchedRating = 0;

            const genreMap = new Map();
            const languageMap = new Map();
            const networkMap = new Map();
            const originCountryMap = new Map();
            const productionCompaniesMap = new Map();
            const productionCountriesMap = new Map();
            const statusMap = new Map();
            const releaseYearSeriesMap = new Map();

            for (const serie of series) {
                serie.genres.forEach((genre) => {
                    genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
                });

                serie.spoken_languages.forEach((language) => {
                    languageMap.set(language.name, (languageMap.get(language.name) || 0) + 1);
                });

                serie.networks.forEach((network) => {
                    networkMap.set(network.name, (networkMap.get(network.name) || 0) + 1);
                });

                serie.origin_country.forEach((country) => {
                    originCountryMap.set(country, (originCountryMap.get(country) || 0) + 1);
                });

                serie.production_countries.forEach((country) => {
                    productionCountriesMap.set(country.name, (productionCountriesMap.get(country.name) || 0) + 1);
                });

                serie.production_companies.forEach((company) => {
                    productionCompaniesMap.set(company.name, (productionCompaniesMap.get(company.name) || 0) + 1);
                });

                serie.episodes.forEach((episode) => {
                    totalWatchedRuntime += episode.runtime;
                    totalWatchedRating += episode.rating;
                });

                totalEpisode += serie.episodes.length;

                statusMap.set(serie.status, (statusMap.get(serie.status) || 0) + 1);
                releaseYearSeriesMap.set(
                    moment(serie.first_air_date).year(),
                    (releaseYearSeriesMap.has(moment(serie.first_air_date).year()) || 0) + 1
                );
            }

            const genreDataset = Array.from(genreMap, ([name, count]) => ({ name, count }));
            const languageDataset = Array.from(languageMap, ([name, count]) => ({ name, count }));
            const networkDataset = Array.from(networkMap, ([name, count]) => ({ name, count }));
            const originCountryDataset = Array.from(originCountryMap, ([name, count]) => ({ name, count }));
            const productionCompaniesDataset = Array.from(productionCompaniesMap, ([name, count]) => ({ name, count }));
            const productionCountriesDataset = Array.from(productionCountriesMap, ([name, count]) => ({ name, count }));
            const statusDataset = Array.from(statusMap, ([name, count]) => ({ name, count }));
            const releaseYearDataset = Array.from(releaseYearSeriesMap, ([name, count]) => ({ name, count })).sort(
                (a, b) => (a.name > b.name ? 1 : -1)
            );

            const avgRating = totalWatchedRating / totalEpisode;

            res.status(200).json({
                genreDataset,
                totalSeries: series.length,
                totalEpisode,
                avgRating,
                totalWatchedRuntime,
                languageDataset,
                networkDataset,
                originCountryDataset,
                productionCompaniesDataset,
                productionCountriesDataset,
                statusDataset,
                releaseYearDataset,
            });
        } catch (error) {
            next(error);
        }
    },

    lastTwentyWeeksMovie: async (req, res, next) => {
        try {
            const weekNumber = Number(req.params.week);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").week() === weekNumber;
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    hourOfDayMovie: async (req, res, next) => {
        try {
            const hour = Number(req.params.hour);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").hour() === hour;
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    dayOfWeek: async (req, res, next) => {
        try {
            const day = Number(req.params.day);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").day() === day;
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    month: async (req, res, next) => {
        try {
            const month = Number(req.params.month);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").month() === month;
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    year: async (req, res, next) => {
        try {
            const year = Number(req.params.year);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return moment(movie.release_date).utc().utcOffset("+05:30").year() === year;
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    getMovieGenre: async (req, res, next) => {
        try {
            const genre = String(req.params.genre);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => {
                return movie.genres.includes(genre);
            });

            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },
    language: async (req, res, next) => {
        try {
            const language = String(req.params.language);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) =>
                movie.spoken_languages.some((lang) => lang.english_name === language)
            );
            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    productionCountry: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) =>
                movie.production_countries.some((con) => con.name === country)
            );
            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    actor: async (req, res, next) => {
        try {
            const actor = String(req.params.actor);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) => movie.casts.some((con) => con.name === actor));
            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    director: async (req, res, next) => {
        try {
            const director = String(req.params.director);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) =>
                movie.crews.some((con) => con.name === director && con.job === "Director")
            );
            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    production: async (req, res, next) => {
        try {
            const production = String(req.params.production);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("movies");

            const movies = user.movies;

            const payloadMovie = movies.filter((movie) =>
                movie.production_companies.some((con) => con.name === production)
            );
            return res.json(payloadMovie);
        } catch (error) {
            next(error);
        }
    },

    getShowsGenre: async (req, res, next) => {
        try {
            const genre = String(req.params.genre);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("series");

            const shows = user.series;

            const filteredShow = shows.filter((show) => {
                return show.genres.includes(genre);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowsStatus: async (req, res, next) => {
        try {
            const status = String(req.params.status);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("series");

            const shows = user.series;

            const filteredShow = shows.filter((show) => {
                return show.status === status;
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowsLanguage: async (req, res, next) => {
        try {
            const language = String(req.params.language);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("series");

            const shows = user.series;

            const filteredShow = shows.filter((show) => {
                return show.spoken_languages.some((lang) => lang.english_name === language);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowsOriginCountry: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("series");

            const shows = user.series;

            const filteredShow = shows.filter((show) => {
                return show.origin_country.some((coun) => coun === country);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowsProductionCountry: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const user = await User.findOne({ username: req.params.username }).select("-password").populate("series");

            const shows = user.series;

            const filteredShow = shows.filter((show) => {
                return show.production_countries.some((coun) => coun.name === country);
            });

            return res.json(filteredShow);
        } catch (error) {
            next(error);
        }
    },

    getShowsLastTwentyWeeks: async (req, res, next) => {
        try {
            const weekNumber = Number(req.params.week);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

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

    getShowsHour: async (req, res, next) => {
        try {
            const hour = Number(req.params.hour);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

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

    getShowsWeekday: async (req, res, next) => {
        try {
            const day = Number(req.params.day);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

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

    getShowsMonth: async (req, res, next) => {
        try {
            const month = Number(req.params.month);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

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

    getShowsYear: async (req, res, next) => {
        try {
            const year = Number(req.params.year);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return moment(show.first_air_date).utc().utcOffset("+05:30").year() == year;
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowsProductionCompany: async (req, res, next) => {
        try {
            const production = String(req.params.production);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return show.production_companies.some((prod) => prod.name === production);
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },

    getShowsNetwork: async (req, res, next) => {
        try {
            const network = String(req.params.network);

            const user = await User.findOne({ username: req.params.username })
                .select("-password")
                .populate({ path: "series", populate: { path: "episodes" } })
                .lean();

            const shows = user.series;

            const seriesWithFilteredEpisodes = shows.filter((show) => {
                return show.networks.some((prod) => prod.name === network);
            });

            return res.json(seriesWithFilteredEpisodes);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = statisticsController;
