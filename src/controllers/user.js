const bcrypt = require('bcrypt');
const validator = require('email-validator');

class UserController {
    /**
     * @param {UserModel} userModel - already instantiated 
     */
    constructor(userModel) {
        this.userModel = userModel;
    }

    /**
     * Signup method
     * @param {string} email 
     * @param {string} password 
     * @returns {object} with status and message parameters
     * @uses UserModel::getUserByEmail
     * @uses UserModel::insertUser
     */
    async newUserSignup(email, password) {
        email = this._validateEmail(email);
        // If not valid, return
        if ( email.status && email.status === 400 ) return email;

        password = await this._hashPassword(password);

        const getUser = await this.userModel.getUserByEmail(email);
        if ( getUser.length !== null && getUser.length !== 0 ) {
            return {
                status: 409,
                message: 'User already exists'
            };
        }

        const userInserted = await this.userModel.insertUser(email, password);
        if ( userInserted && userInserted.insertId ) {
            return {
                status: 201,
                message: `Created new user for email: ${email}`
            };
        }

        return null;
    }

    /**
     * Log in method
     * @param {string} email 
     * @param {string} password 
     * @returns {object} with userId, status, and message parameters
     * @uses UserModel::getUserByEmail
     */
    async loginUser(email, password) {
        const userRow = await this.userModel.getUserByEmail(email);
        if ( userRow.length === 0 ) {
            return {
                status: 404,
                message: 'User does not exist'
            };
        }
        if ( await bcrypt.compare(password, userRow[0].password) ) {
            return {
                userId: userRow[0].id,
                status: 200,
                message: `${email} is now logged in`
            };
        } else {
            return {
                status: 401,
                message: 'Incorrect password'
            };
        }
    }

    async _hashPassword(password) {
        try {
            return await bcrypt.hash(password, 10);
        } catch(err) {
            throw(err);
        }
    }

    _validateEmail(email) {
        if ( !validator.validate(email) ) {
            return {
                status: 400,
                message: 'Not a valid email'
            };
        } else {
            return email;
        }
    }
}

module.exports = UserController;