const mongoose = require("mongoose");

const connectDB = () => {
    let URI = null;
    if (process.env.NODE_ENV === "development") URI = process.env.NON_PROD_MONGO_URI;
    else if (process.env.NODE_ENV === "production") URI = process.env.PROD_MONGO_URI;

    mongoose
        .connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("Db Connected :", process.env.NODE_ENV))
        .catch((err) => console.log(`${err} could not connect`));
};

module.exports = connectDB;
