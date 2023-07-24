const User = require("../models/Users");
const moment = require("moment");

const { logEvents } = require("../middlewares/logger");

const statisticsController = {
    totalStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies for user ${req.user}`, "appLog.log");

            const user = await User.findOne({ username: req.user })
                .populate("movies")
                .populate({
                    path: "series",
                    populate: { path: "episodes" },
                });

            const movies = user?.movies;
            const series = user?.series;

            let movieGenreDataset = [];
            let totalMovieRuntime = 0;
            let totalMovieRating = 0;
            let totalMovies = movies.length;
            let avgMovieRating = 0;

            const movieGenreMap = new Map();
            for (const movie of movies) {
                for (const genre of movie.genres) {
                    if (movieGenreMap.has(genre)) {
                        movieGenreMap.set(genre, movieGenreMap.get(genre) + 1);
                    } else {
                        movieGenreMap.set(genre, 1);
                    }
                }
                totalMovieRuntime += movie.runtime;
                totalMovieRating += movie.rating;
            }

            for (const [genre, count] of movieGenreMap) {
                movieGenreDataset.push({ name: genre, count });
            }
            avgMovieRating = totalMovieRating / totalMovies;

            let seriesGenreDataset = [];
            let totalSeries = series.length;
            let totalEpisodes = 0;
            let totalEpisodeRuntime = 0;
            let avgEpisodeRating = 0;
            let totalEpisodeRating = 0;

            const seriesGenreMap = new Map();
            for (const serie of series) {
                for (const genre of serie.genres) {
                    if (seriesGenreMap.has(genre)) {
                        seriesGenreMap.set(genre, seriesGenreMap.get(genre) + 1);
                    } else {
                        seriesGenreMap.set(genre, 1);
                    }
                }
                for (const episode of serie.episodes) {
                    totalEpisodeRuntime += episode.runtime;
                    totalEpisodeRating += episode.rating;
                }
                totalEpisodes += serie.episodes.length;
            }

            for (const [genre, count] of seriesGenreMap) {
                seriesGenreDataset.push({ name: genre, count });
            }
            avgEpisodeRating = totalEpisodeRating / totalEpisodes;

            res.status(200).json({
                movieGenreDataset,
                totalMovieRating,
                totalMovieRuntime,
                totalMovies,
                avgMovieRating,
                seriesGenreDataset,
                totalSeries,
                totalEpisodes,
                totalEpisodeRuntime,
                totalEpisodeRating,
                avgEpisodeRating,
            });
        } catch (error) {
            next(error);
        }
    },
    totalMovieStats: async (req, res, next) => {
        try {
            logEvents(`Fetching stats of movies for user ${req.user}`, "appLog.log");

            const movies = (await User.findOne({ username: req.user }).populate("movies")).movies;

            let genreDataset = [];
            let languageDataset = [];
            let productionCountriesDataset = [];
            let productionCompaniesDataset = [];
            let releaseYearDataset = [];
            let castDataset = [];
            let directorDataset = [];
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

            for (const movie of movies) {
                for (const genre of movie.genres) {
                    if (genreMap.has(genre)) genreMap.set(genre, genreMap.get(genre) + 1);
                    else genreMap.set(genre, 1);
                }

                for (const language of movie.spoken_languages) {
                    if (languageMap.has(language.english_name))
                        languageMap.set(language.english_name, languageMap.get(language.english_name) + 1);
                    else languageMap.set(language.english_name, 1);
                }

                for (const country of movie.production_countries) {
                    if (productionCountriesMap.has(country.name))
                        productionCountriesMap.set(country.name, productionCountriesMap.get(country.name) + 1);
                    else productionCountriesMap.set(country.name, 1);
                }

                for (const company of movie.production_companies) {
                    if (productionCompaniesMap.has(company.name))
                        productionCompaniesMap.set(company.name, productionCompaniesMap.get(company.name) + 1);
                    else productionCompaniesMap.set(company.name, 1);
                }

                for (const cast of movie.casts) {
                    if (castMap.has(cast.name)) castMap.set(cast.name, castMap.get(cast.name) + 1);
                    else castMap.set(cast.name, 1);
                }

                for (const crew of movie.crews.filter((c) => c.job === "Director")) {
                    if (directorMap.has(crew.name)) directorMap.set(crew.name, directorMap.get(crew.name) + 1);
                    else directorMap.set(crew.name, 1);
                }

                if (releaseYearMap.has(moment(movie.release_date).year()))
                    releaseYearMap.set(
                        moment(movie.release_date).year(),
                        releaseYearMap.get(moment(movie.release_date).year() + 1)
                    );
                else releaseYearMap.set(moment(movie.release_date).year(), 1);

                totalRuntime += movie.runtime;
                totalRating += movie.rating;
            }

            for (const [year, count] of releaseYearMap) {
                releaseYearDataset.push({
                    name: year,
                    count,
                });
            }

            for (const [country, count] of productionCountriesMap) {
                productionCountriesDataset.push({ name: country, count });
            }

            for (const [company, count] of productionCompaniesMap) {
                productionCompaniesDataset.push({ name: company, count });
            }

            for (const [language, count] of languageMap) {
                languageDataset.push({ name: language, count });
            }

            for (const [genre, count] of genreMap) {
                genreDataset.push({ name: genre, count });
            }

            for (const [cast, count] of castMap) {
                castDataset.push({ name: cast, count });
            }

            for (const [crew, count] of directorMap) {
                directorDataset.push({ name: crew, count });
            }

            const avgRating = totalRating / movies.length;

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

            let genreCount = {};
            let totalSeries = series.length;
            let totalEpisode = 0;
            let totalWatchedRuntime = 0;
            let totalWatchedRating = 0;

            const movieGenreMap = new Map();
            for (const serie of series) {
                for (const genre of serie.genres) {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;

                    totalEpisode += serie.episodes.length;
                }
                for (const episode of serie.episodes) {
                    totalWatchedRuntime += episode.runtime;
                    totalWatchedRating += episode.rating;
                }
            }

            const avgRating = totalWatchedRating / totalEpisode;

            res.status(200).json({ genreCount, totalSeries, totalEpisode, avgRating, totalWatchedRuntime });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = statisticsController;
