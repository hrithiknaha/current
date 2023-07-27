const User = require("../models/Users");
const moment = require("moment");

const { logEvents } = require("../middlewares/logger");
const { set } = require("mongoose");

const statisticsController = {
    totalStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies and tv series for user ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.user })
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
            let totalSeries = series.length;
            let totalEpisode = 0;
            let totalWatchedRuntime = 0;
            let totalWatchedRating = 0;

            const genreSeriesMap = new Map();
            const releaseYearSeriesMap = new Map();
            const languageSeriesMap = new Map();
            const networkSeriesMap = new Map();
            const originCountrySeriesMap = new Map();
            const productionCompaniesSeriesMap = new Map();
            const productionCountriesSeriesMap = new Map();
            const statusSeriesMap = new Map();

            for (const serie of series) {
                for (const genre of serie.genres) {
                    genreSeriesMap.set(genre, (genreSeriesMap.get(genre) || 0) + 1);
                }

                for (const language of serie.spoken_languages) {
                    languageSeriesMap.set(language.name, (languageSeriesMap.get(language.name) || 0) + 1);
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
                }

                if (releaseYearSeriesMap.has(moment(serie.first_air_date).year())) {
                    releaseYearSeriesMap.set(
                        moment(serie.first_air_date).year(),
                        releaseYearSeriesMap.get(moment(serie.first_air_date).year()) + 1
                    );
                } else {
                    releaseYearSeriesMap.set(moment(serie.first_air_date).year(), 1);
                }

                if (statusSeriesMap.has(serie.status)) {
                    statusSeriesMap.set(serie.status, statusSeriesMap.get(serie.status) + 1);
                } else {
                    statusSeriesMap.set(serie.status, 1);
                }

                totalEpisode += serie.episodes.length;
            }

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

            const genreMovieMap = new Map();
            const languageMovieMap = new Map();
            const productionCountriesMovieMap = new Map();
            const productionCompaniesMovieMap = new Map();
            const releaseYearMovieMap = new Map();
            const castMovieMap = new Map();
            const directorMovieMap = new Map();

            for (const movie of movies) {
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

            console.log(movies);
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
};

module.exports = statisticsController;
