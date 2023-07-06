const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "Asia/Kolkata",
};

const logEvents = async (message, fileName) => {
    const date = new Date();
    const dateTime = new Intl.DateTimeFormat("en-US", options).format(date);
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
            await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
        }

        await fsPromises.appendFile(path.join(__dirname, "..", "logs", fileName), logItem);
    } catch (err) {
        console.log(err);
    }
};

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method}\t${req.url}`);
    next();
};

module.exports = { logger, logEvents };
