var config = require('../env.json')[process.env.NODE_ENV || 'development'];


module.exports = {
    MONGO_URL: config.MONGO_URL,
    KAFKA_URL: config.KAFKA_URL
};