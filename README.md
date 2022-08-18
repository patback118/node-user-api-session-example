## Introduction

Quick example of a User Session Flow that is close to production level.

NOTE: only for demonstration purposes. For example, we wouldn't want to share our .env file with all of our passwords! (would want to gitignore that file as well)

## Key Objectives:

- [x] Unit Tests
- [x] User Register
- [x] User Login
- [x] User Logout
- [x] SQL scripts
- [x] Dockerfile(s) and docker-compose setup
- [x] Postman collection

## Starting the Application

Running a `npm install` will get it setup.

*Please note that only Jest tests will run properly outside of docker.*

### Docker and docker-compose start

`docker-compose up -d` - will get the application up and running.

`docker-compose down` - to stop the application.

`docker-compose down --rmi all` - to stop the application and delete all containers 

*Note: the db volume is persistent even after a down all*

`npm run dc-destroy` - to stop the application, delete containers, and delete DB volume (useful when testing on Postman)

## Opening the Ports

After running `docker-compose up -d`, the ports on the bottom right side (of VS Code view) will be listed.

Please make the `6868` one public and then open in browser to copy the correct Host Url (used later to update Postman Collection).

## Running Tests

I've created a few tests to verify the behavior of the user login module.

Jest was used for unit tests, while the Postman Collection tests help verify integration and end-to-end behavior.

### Jest Unit Tests

Jest tests should be run on the local dev environment as they mock any outside dependencies (like the DB).

A quick `npm install` will get those.

Run tests like so: `npm run test`

**Why only write unit tests for the UserController?**

I tried to design the controller to be where all the custom logic (like password hashing, email validation) would exist.

This way the UserModel is just the mysql query's typical results, and all checks of those results happen in the controller.

The routes are tested in Postman, which also indirectly verify the mysql behavior.

### Postman Collection

*I've included the postman collection as JSON in this directory to ensure that it can be imported*

**Note: As your host url may be different, please update the collection variable `Current Host Url` by clicking Edit in the collection, then Variables, then update the Current Value, and finally Save the collection before Running.**

When running the Postman collection, there are a few quick tests in place to verify the status codes and responses.

The calls in the collection should be run in order with a delay of 1000 ms.

Please note that on the second collection run, the following tests will fail due to a user with the email `test@test.com` already being created.

- Login before user created
- Signup successfully

**Rerunning Postman Collection with a fresh DB**

To rerun the Postman collection fresh after a `docker-compose up -d`, run `npm run dc-destroy` to delete all containers and remove the DB volume.

Then rerun the Postman collection after a `docker-compose up -d`.

## Security Choices

Storing the session in mysql with `express-mysql-session` should be better then in memory. Using mysql for the sessions also saves us from an additional dependency such as Redis (though not against using Redis or another store).

In `app.js` within the `session_options` object, I had some trouble getting the session cookie for `userId` to set. I ended up passing the `proxy: true` parameter and that allowed `secure: true` to be set as well.

I also tried to be careful of how error messages were logged, but recognize there could be some holes if for instance the DB didn't instantiate correctly. That said, for api calls I only wanted to return the `err.message` rather than a more detailed one to not let DB details or other sensitive info slip. Probably could implement an error lookup table to completely control what info the api user needs to know.

## Design Choices

As mentioned above, I went with a Model/Controller setup to allow the controller to handle most of the logic (and be easily tested).

I also tried to inject dependencies down from the index (app.js) to the modules that needed them. To do this, I used ES6 classes to keep the files clean and make clear which methods were public and which are private (those preceded by `_`).

## Dependencies

- mysql (while not as popular with node, I find relational dbs to be easier to work with)

- express (minimal and mature)
- express-session (for session management)
- express-mysql-session (helps with session table creation)
- dotenv (to read env variables in node, allows easy sharing between the app and docker)
- cors (could probably be better setup but felt it was necessary)
- bcrypt (only want to store hashed passwords)
- email-validator (easier then writing regex, hopefully faster as well)
- jest (jest is fairly user friendly)

## Possible Next Steps

- Better logs and log monitoring
- DOS protection
- Protocol to keep dependencies up to date (security)
- Email verification
- Password reset
- Persistent login (Remember me)
- Access Token for direct API access
- The update and delete of CRUD:
 - Ability to change (update) password
 - Ability to delete user
