const { createClient } = require("redis");

let client = null;

(async () => {
    try {
        client = createClient({
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            },
        });

        client.on("error", (err) => {
            console.log("Redis Client Error", err);
        });

        await client.connect();

        console.log("Redis cache app database connected.");
    } catch (error) {
        console.error("Redis app connection Error:", error);
    }
})();

module.exports = () => client;
