const axios = require("axios");

const isDevelopment = process.env.NODE_ENV === "development";

// Set the base URL accordingly
const baseURL = isDevelopment ? "http://localhost:5001" : "https://current-api.cyclic.app";

const axiosPublicInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

const axiosPrivateInstance = (auth) =>
    axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
        },
    });

module.exports = { axiosPublicInstance, axiosPrivateInstance };
