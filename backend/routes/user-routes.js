// routes for the user

// import the required modules
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controllers');
const passport = require('passport'); // Import Passport

// create a new user
router.post('/signup', userController.createUser);

// login a user and set the session to false

router.post('/login', userController.loginUser);

// Route to initiate Google authentication
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email', 'openid']}));

// Route to handle Google authentication callback
router.get('/auth/google/callback', passport.authenticate('google', {session: false}), userController.googleAuth);

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {session: false}), userController.facebookAuth);

module.exports = router;