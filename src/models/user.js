class UserModel {
    /**
     * @param {mysql} mysql - package from require 
     * @param {mysql.Pool} pool - from createPool() 
     */
    constructor(mysql, pool) {
        this.mysql = mysql;
        this.pool = pool;
    }

    /**
     * Select query to find user by email
     * @param {string} email 
     * @returns {Promise} result of query
     * @uses Promise for the pool.query method
     */
    getUserByEmail(email) {
        const seachQuery = this.mysql.format(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return new Promise((resolve, reject) => {
            this.pool.query(seachQuery, (error, res) => {
                if (error) {
                    return reject(error);
                }
                return resolve(res);
            })
        })
    }

    /**
     * Insert query for new user
     * @param {string} email 
     * @param {string} hashedPassword - hashed in controller
     * @returns {Promise} result of query
     * @uses Promise for the pool.query method
     */
    insertUser(email, hashedPassword) {
        const insertQuery = this.mysql.format(
            'INSERT INTO users VALUES (0, ?, ?)',
            [email, hashedPassword]
        );
        return new Promise((resolve, reject) => {
            this.pool.query(insertQuery, (error, res) => {
                if (error) {
                    return reject(error);
                }
                return resolve(res);
            })
        })
    }
}

module.exports = UserModel;