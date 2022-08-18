const express = require('express');
require("dotenv").config();
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors=require("cors");
const MySQLStore = require('express-mysql-session')(session);
const UserModel = require('./src/models/user');
const UserController = require('./src/controllers/user');
const userRoutes = require('./src/routes/user');

const PORT = process.env.APP_DOCKER_PORT;
const is_prod = process.env.NODE_ENV === 'production';
const two_hours = 1000 * 60 * 60 * 2;

const db_options = {
    host: process.env.DB_HOST,
    port: process.env.DB_DOCKER_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    connectionLimit: 10
};

const pool = mysql.createPool(db_options);

/**
 * Application starts after the DB connection is ready
 * @uses async
 */
pool.getConnection(async (err) => {
    if (err) throw (err);

    console.log("DB connected successfully");

    const sessionStore = new MySQLStore(db_options, pool);
    const userModel = new UserModel(mysql, pool);
    const userController = new UserController(userModel);

    const session_options = {
        name: process.env.SESSION_NAME,
        key: process.env.SESSION_NAME,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            maxAge: two_hours,
            sameSite: 'strict',
            secure: is_prod
        }
    };
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());
    app.use(session(session_options));
    app.use('/user', userRoutes.userRoutes(express, userController, sessionStore));

    app.listen(PORT, () => {console.log(`server is listening on ${PORT}`)});
});