const { Router } = require("express");
const MySQLStore = require("express-mysql-session");

/**
 * Routes for the /user subdirectory
 * @param {Express} express 
 * @param {UserController} userController 
 * @param {MySQLStore} sessionStore
 * @returns {Router} router - api routes 
 * @see - Only include err.message when returning errors to api calls
 */
function userRoutes(express, userController, sessionStore) {
    const router = express.Router();

    router.post('/signup', async (req, res) => {
        try {
            if ( !req.body || !req.body.email || !req.body.password ) {
                const error = new Error('Email or password not set in body');
                error.status = 400;
                throw error;
            }
            const newUser = await userController.newUserSignup(req.body.email, req.body.password);
            if ( newUser.status && newUser.message ) {
                return res.status(newUser.status).json({
                    message: newUser.message
                });
            } else {
                throw new Error('Uncaught error');
            }
        } catch(err) {
            console.log(err);
            const statusCode = err.status ? err.status : 500;
            return res.status(statusCode).json({
                error: err.message ? err.message : 'Uncaught error'
            });
        }
    });

    router.post('/login', async (req, res) => {
        try {
            if ( !req.body || !req.body.email || !req.body.password ) {
                const error = new Error('Email or password not set in body');
                error.status = 400;
                throw error;
            }
            const loggedIn = await userController.loginUser(req.body.email, req.body.password);

            if ( loggedIn.userId !== false ) {
                // If the user id is set from the controller, save to the session
                req.session.userId = loggedIn.userId;
            }

            if ( loggedIn.status && loggedIn.message ) {
                return res.status(loggedIn.status).json({
                    message: loggedIn.message
                });
            } else {
                throw new Error('Uncaught error');
            }
        } catch(err) {
            console.log(err);
            const statusCode = err.status ? err.status : 500;
            return res.status(statusCode).json({
                error: err.message ? err.message : 'Uncaught error'
            });
        }
    });

    router.get('/logout', (req, res) => {
        if ( !req.session.userId ) {
            // Not logged in so return a 204, no body needed
            return res.sendStatus(204);
        }
        return req.session.destroy(err => {
            if (err) {
                return res.status(500).json({
                    error: err.message ? err.message : 'Uncaught error'
                });
            }
            sessionStore.close();
            res.clearCookie(process.env.SESSION_NAME);
            if ( req.session && req.session.userId ) {
                req.session.userId = null;
            }
            return res.status(200).json({
                message: 'Logged out'
            });
        })
    });

    return router;
}

module.exports.userRoutes = userRoutes;