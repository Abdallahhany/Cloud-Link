// connect to our sequelize database

// import the required modules
const Sequelize = require('sequelize');

// import the configuration
const config = require('../config/config-env');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect
});

module.exports = sequelize;