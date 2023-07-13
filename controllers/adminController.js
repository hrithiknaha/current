const csv = require("csv-parser");
const fs = require("fs");
const axios = require("axios");

const searchAppender = require("../helpers/searchLodash");

const adminController = {
    bulkUploadMovies: (req, res, next) => {
        const file = req.file;
        const results = [];
        fs.createReadStream(file.path)
            .pipe(csv())
            .on("data", async (data) => {
                const queryString = data.Name;
                const language = "en-US";
                const page = 1;

                const query = searchAppender(queryString);
                const response = await axios.get(`/search/movie?query=${query}&language=${language}&page=${page}`);
                const payload = {
                    movie_id: response.data.results.id,
                    theatre: data.theatre,
                    rating: data.rating,
                    date_watched: data.date_watched,
                };

                const finalResponse = await axios.post("localhost:5001/api/movies/add", payload);
                console.log("Git test");
            })
            .on("end", () => {
                // Process the parsed CSV data
                console.log(results);
                res.status(200).send("CSV file uploaded and parsed successfully");
            });
    },
};

module.exports = adminController;
