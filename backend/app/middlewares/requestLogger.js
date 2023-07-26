// middlewares/requestLogger.js

const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/app.log');

const requestLogger = (req, res, next) => {
    const { method, url, query, body, user } = req;
    const userId = user ? user.id : 'Guest'; // Assuming you have a user object with 'id' property when the user is authenticated
    const logMessage = `User: ${userId}, Method: ${method}, URL: ${url}, Query: ${JSON.stringify(
        query
    )}, Body: ${JSON.stringify(body)}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    next();
};

module.exports = requestLogger;
