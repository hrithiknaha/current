const moment = require("moment");

const { fetchUserMovies } = require("../../services/userServices");

const movieController = {
    getMovieLastTwentyWeekStats: async (req, res, next) => {
        try {
            const weekNumber = Number(req.params.week);

            const movies = await fetchUserMovies(req.user);

            const filteredMovies = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").week() === weekNumber;
            });

            return res.json(filteredMovies);
        } catch (error) {
            next(error);
        }
    },

    getMovieHourOfDayStats: async (req, res, next) => {
        try {
            const hour = Number(req.params.hour);

            const movies = await fetchUserMovies(req.user);

            const filteredMovies = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").hour() === hour;
            });

            return res.json(filteredMovies);
        } catch (error) {
            next(error);
        }
    },

    getMovieDayOfWeekStats: async (req, res, next) => {
        try {
            const day = Number(req.params.day);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").day() === day;
            });

            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieMonthStats: async (req, res, next) => {
        try {
            const month = Number(req.params.month);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) => {
                return moment(movie.date_watched).utc().utcOffset("+05:30").month() === month;
            });

            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieYearStats: async (req, res, next) => {
        try {
            const year = Number(req.params.year);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) => {
                return moment(movie.release_date).utc().utcOffset("+05:30").year() === year;
            });

            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieGenreStats: async (req, res, next) => {
        try {
            const genre = String(req.params.genre);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) => {
                return movie.genres.includes(genre);
            });

            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieLanguageStats: async (req, res, next) => {
        try {
            const language = String(req.params.language);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) =>
                movie.spoken_languages.some((lang) => lang.english_name === language)
            );
            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieProductionCountryStats: async (req, res, next) => {
        try {
            const country = String(req.params.country);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) =>
                movie.production_countries.some((con) => con.name === country)
            );
            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieActorStats: async (req, res, next) => {
        try {
            const actor = String(req.params.actor);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) => movie.casts.some((con) => con.name === actor));
            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieDirectorStats: async (req, res, next) => {
        try {
            const director = String(req.params.director);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) =>
                movie.crews.some((con) => con.name === director && con.job === "Director")
            );
            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },

    getMovieProductionCompanyStats: async (req, res, next) => {
        try {
            const company = String(req.params.company);

            const movies = await fetchUserMovies(req.user);

            const filteredMoviese = movies.filter((movie) =>
                movie.production_companies.some((con) => con.name === company)
            );
            return res.json(filteredMoviese);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = movieController;
