// Desc: This is the main entry point for the application "CloudLink"
// Author: Abdallah Rashed
// Date Created: 2023-06-29 06:00:00
// the main entry point for the application

// import the required modules
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const config = require('./config/config-env');
const sequelize = require('./app/util/database');
const passport = require('./config/config-passport');

// project routes
const userRoutes = require('./app/routes/user-routes');
const folderRoutes = require('./app/routes/folder-routes');

// import the Models
const User = require('./app/models/user-model');
const Folder = require('./app/models/folder-model');

// import logger
const requestLogger = require('./app/middlewares/requestLogger');


const app = express();

// import the database connection
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Define the associations
User.hasMany(Folder, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
Folder.belongsTo(User);


Folder.belongsTo(Folder, {
    as: 'parentFolder',
    foreignKey: 'parentFolderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Folder.hasMany(Folder, {
    as: 'children',
    foreignKey: 'parentFolderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});


// import the middlewares
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

// Initialize Passport and session
app.use(passport.initialize());

// import the logger
app.use(requestLogger);

// define the routes
app.use('/api/users', userRoutes);
app.use('/api/folders', folderRoutes);

// import the error handlers

// import the configuration

// import the port number
const port = config.port;
// import the server

// start the server
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});