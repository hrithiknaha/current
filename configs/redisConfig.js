const { createClient } = require("redis");

let client = null;

(async () => {
    try {
        client = createClient({
            password: "hDFCApIImqW7kCZNzWFADP4EoaEAgVAX",
            socket: {
                host: "redis-17310.c305.ap-south-1-1.ec2.cloud.redislabs.com",
                port: 17310,
            },
        });

        client.on("error", (err) => {
            console.log("Redis Client Error", err);
        });

        await client.connect();

        console.log("Redis cache app database connected...");
    } catch (error) {
        console.error("Redis app connection Error:", error);
    }
})();

module.exports = () => client;
