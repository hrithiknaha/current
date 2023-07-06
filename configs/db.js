const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = () =>
    mongoose
        .connect(process.env.NON_PROD_MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("Db Connected"))
        .catch((err) => console.log(`${err} could not connect`));

module.exports = connectDB;
