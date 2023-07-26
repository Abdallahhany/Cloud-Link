// passport-config.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const {ExtractJwt} = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;


const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const configEnv = require('../config/config-env');

// Configure the local strategy for passport
passport.use(
    new LocalStrategy(
        {usernameField: 'username',},
        async (username, password, done) => {
            try {
                // Find the user by username
                const user = await userModel.findOne({where: {username}});

                // If user is not found
                if (!user) {
                    return done(null, false, {message: 'Incorrect username'});
                }

                // Compare passwords
                const isPasswordValid = await bcrypt.compare(password, user.password);

                // If password is invalid
                if (!isPasswordValid) {
                    return done(null, false, {message: 'Incorrect password'});
                }

                // If username and password are correct, return the user
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Configure JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: configEnv.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            // Find the user by ID in the payload
            const user = await userModel.findByPk(payload.sub);

            // If user is not found
            if (!user) {
                return done(null, false);
            }

            // If user is found
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: configEnv.google.clientID,
            clientSecret: configEnv.google.clientSecret,
            callbackURL: '/api/users/auth/google/callback',
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        })
);

passport.use(
    new FacebookStrategy(
        {
            clientID: configEnv.facebook.clientID,
            clientSecret: configEnv.facebook.clientSecret,
            callbackURL: '/api/users/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email', ],
            scope: ['email', 'user_birthday',]
        }, (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            done(null, profile);
        })
)


module.exports = passport;


