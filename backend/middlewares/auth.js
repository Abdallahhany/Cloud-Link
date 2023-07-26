// to check whether the user is authenticated or not
const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');
const configEnv = require('../config/config-env');

const checkAuth = async (req, res, next) => {
    try {
        // get the token from the authorization header
        const token = req.headers.authorization.split(' ')[1];
        // verify the token
        const decoded = await jwt.verify(token, configEnv.JWT_SECRET);
        // get the user from decoded data
        const user = await userModel.findByPk(decoded.id);
        // if the user is not found
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        // set the user in request object
        req.user = user;
        // call the next middleware
        next();
    } catch (e) {
        console.log(e)
        return res.status(401).json({
            message: 'Authentication failed'
        });
    }
}

module.exports = checkAuth;