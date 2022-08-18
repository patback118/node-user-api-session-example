const UserController = require('../../src/controllers/user');

const userModel = jest.mock('../../src/models/user');
userModel.insertUser = jest.fn();
userModel.getUserByEmail = jest.fn();
const bcrypt = jest.mock('bcrypt');
bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();
const validator = jest.mock('email-validator');
validator.validate = jest.fn();

describe('Testing new user signup', () => {
    it('returns correctly when new user created', async() => {
        userModel.getUserByEmail.mockResolvedValueOnce([]);
        userModel.insertUser.mockResolvedValueOnce({insertId: 1});
        bcrypt.hash.mockResolvedValueOnce('r1c3f39c');
        validator.validate.mockReturnValueOnce(true);

        const userController = new UserController(userModel);
        
        let email = 'test@test.com';
        let password = 'test';
        let res = await userController.newUserSignup(email, password);

        expect(res).toMatchObject({
            status: 201,
            message: `Created new user for email: ${email}`
        });
    })

    it('returns correctly when user already exists', async() => {
        let mockEmail = 'test@test.com';
        userModel.getUserByEmail.mockResolvedValueOnce(
            [{id:2,email:mockEmail,password:'232jfj2j3'}]
        );
        bcrypt.hash.mockResolvedValueOnce('232jfj2j3');
        validator.validate.mockReturnValueOnce(true);

        const userController = new UserController(userModel);
        
        let password = 'test';
        let res = await userController.newUserSignup(mockEmail, password);

        expect(res).toMatchObject({
            status: 409,
            message: `User already exists`
        });
    })

    it('returns correctly when invalid email', async() => {
        validator.validate.mockReturnValueOnce(false);

        const userController = new UserController(userModel);
        
        let email = 'thisiswrong';
        let password = 'test';
        let res = await userController.newUserSignup(email, password);

        expect(res).toMatchObject({
            status: 400,
            message: `Not a valid email`
        });
    })
})

describe('Testing user login', () => {
    it('returns correctly when user does not exist', async() => {
        userModel.getUserByEmail.mockResolvedValueOnce([]);

        const userController = new UserController(userModel);
        
        let email = 'test@test.com';
        let password = 'test';
        let res = await userController.loginUser(email, password);

        expect(res).toMatchObject({
            status: 404,
            message: `User does not exist`
        });
    })

    it('returns correctly when password is correct', async() => {
        // True hashed password for 'test', if not set this way bcrypt.compare doesn't resolve
        let mockHashedPassword = '$2b$10$yyF6nmTA4wdxjiytBxEhwOhTAwL743UbdyonSJeHkGQjtKI.2ob/.';
        let mockUserId = 1;
        let mockEmail = 'test@test.com';

        userModel.getUserByEmail.mockResolvedValueOnce(
            [{id:mockUserId,email:mockEmail,password:mockHashedPassword}]
        );
        bcrypt.compare.mockResolvedValueOnce(true);

        const userController = new UserController(userModel);
        
        let password = 'test';
        let res = await userController.loginUser(mockEmail, password);

        expect(res).toMatchObject({
            userId: mockUserId,
            status: 200,
            message: `${mockEmail} is now logged in`
        });
    })

    it('returns correctly when password incorrect', async() => {
        let mockHashedPassword = 'ch3heuhse09';
        userModel.getUserByEmail.mockResolvedValueOnce(
            [{id:1,email:'test@test.com',password:mockHashedPassword}]
        );
        bcrypt.compare.mockResolvedValueOnce(false);

        const userController = new UserController(userModel);
        
        let email = 'test@test.com';
        let password = 'test';
        let res = await userController.loginUser(email, password);

        expect(res).toMatchObject({
            status: 401,
            message: `Incorrect password`
        });
    })
})