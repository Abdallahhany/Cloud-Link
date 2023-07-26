// controllers for user

// import the required modules
const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const configEnv = require('../config/config-env');


// create a new user with the normal method
exports.createUser = async (req, res, next) => {
    try {
        // get the user data from request body
        const {username, password, email, phone, avatar} = req.body;
        // validate the user data
        if (!username || !password || !email) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }

        // check if the username or email already exists
        const user = await userModel.findOne({
            $or: [
                {username: username},
                {email: email}
            ]
        });

        // if the username or email already exists
        if (user) {
            return res.status(400).json({
                message: 'Username or email already exists'
            });
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user
        const newUser = await userModel.create({
            username,
            password: hashedPassword,
            email,
            phone,
            avatar
        });

        // return the new user
        return res.status(201).json({
            message: 'userModel created successfully',
            user: newUser
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: e.message
        });
    }
}

// use passport to login a user
exports.loginUser = async (req, res, next) => {
    // Use the 'local' strategy for authentication
    passport.authenticate('local', {session: false}, (err, user, info) => {
        // if an error occurs
        if (err) {
            return res.status(500).json({
                message: err.message,
            });

        }

        // if the user is not found
        if (!user) {
            return res.status(404).json({
                message: info.message,
            });
        }
        // Generate a JWT token
        const token = jwt.sign({id: user.id}, configEnv.JWT_SECRET, {
            expiresIn: '1h' // Set the token expiration time
        });


        // Return the token and user information
        return res.status(200).json({
            message: 'User logged in successfully',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    })(req, res, next);
}

// authenticate a user with Google
exports.googleAuth = async (req, res, next) => {
    passport.authenticate('google', {session: false}, async (err, user, info) => {
        try {
            // Retrieve the authenticated user data
            user = req.user;

            // save user data to database if not exists
            const userExists = await userModel.findOne({email: user.emails[0].value});
            let newUser;
            if (!userExists) {
                newUser = await userModel.create({
                    username: user.displayName,
                    email: user.emails[0].value,
                    avatar: user.photos[0].value,
                });
            }
            console.log("userExists", userExists);
            console.log("newUser", newUser);

            // Get the user id to use in the JWT payload
            const userId = userExists ? userExists.id : newUser.id;

            console.log("userId", userId)

            // Generate a JWT token for the user
            const token = jwt.sign({id: userId}, configEnv.JWT_SECRET, {
                expiresIn: '1h', // Set the token expiration time
            });

            // Return the token and user data
            res.status(200).json({
                message: 'User logged in successfully',
                token: token,
                user: {
                    id: userId, // Use the userId obtained from userExists or newUser
                    username: user.displayName.trim(),
                    email: user.emails[0].value,
                },
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                message: e.message,
            });
        }
    })(req, res, next);
};


// authenticate a user with Facebook
exports.facebookAuth = async (req, res, next) => {
    passport.authenticate('facebook', {session: false}, async (err, user, info) => {
        try {
            // Retrieve the authenticated user data
            user = req.user;

            // Generate a JWT token for the user
            const token = jwt.sign({id: user.id}, configEnv.JWT_SECRET, {
                expiresIn: '1h' // Set the token expiration time
            });

            // save user data to database if not exists
            const userExists = await userModel.findOne({email: user.emails[0].value});

            if (!userExists) {
                await userModel.create({
                    username: user.displayName,
                    email: user.emails[0].value,
                    avatar: user.photos[0].value
                });
            }


            // Return the token and user data
            res.status(200).json({
                message: 'User logged in successfully',
                token: token,
                user: {
                    id: user.id,
                    username: user.displayName.trim(),
                    email: user.emails[0].value
                }
            });
        } catch (e) {
            console.log(e)
            return res.status(500).json({
                message: e.message
            });
        }
    })(req, res, next);
}
