// configEnv environment variables

require('dotenv').config();

const configEnv = {
    port: process.env.PORT || 8080,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        name: process.env.DB_NAME || 'cloudlink',
        password: process.env.DB_PASS || '',
        user: process.env.DB_USER || 'root',
        dialect: process.env.DB_DIALECT || 'mysql',
    },
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    google:{
        clientID: process.env.GOOGLE_CLIENT_ID ,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    facebook:{
        clientID: process.env.FACEBOOK_CLIENT_ID ,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }
}

module.exports = configEnv;