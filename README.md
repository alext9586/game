# Setup
Requires NodeJS, NPM, and MongoDB.

Remote DB is for production use ONLY. Use a local mongodb or setup a Heroku dev env for testing.

# Documentation
If updating any API make sure the documentation is up to date.  
http://docs.dorkapi.apiary.io/

# Running
1. Start a MongoDb instance (only required if using local mongodb; not necessary if pointing to dev or prod DB via config file)
`> mongod`
    * **Note:** You must have database path already set up on local machine or mongo won't run.
2. Type `heroku local` to start instance.
    * **Note:** Mongo must be started first or web app won't run.
3. Test that the server is running by going to `localhost:5000` in your browser.

# Cloning Production Database to Local
1. Open command prompt (Windows) or Terminal (Mac/Linux) and navigate to the project's working folder (`dork_api`).
2. Get the config vars from Heroku with `heroku config --app dork-prod`
    * Find the `MONGOLAB_URI` value. It will be in the form of: `mongodb://<username>:<password>@<url>:<port>/<database>`
3. Run the following command to make a copy of the production database to your local working directory.
    * Use the values from the config file: `mongodump -h <url>:<port> -d <database> -u <username> -p <password>`
    * `mongodump` will create the following directory to store the data: `dump/<database>/`
4. Make sure your local instance of `mongod` is running.
5. Drop your existing local database with the following command.
    * `mongo dorkdb --eval "db.dropDatabase()"`
6. Use `mongorestore` to put the prod data into your local mongodb.
    * `mongorestore -d dorkdb dump/<database>/`
7. Ensure data was restored
    * Start mongo command line interface: `mongo`
    * Show databases and ensure `dorkdb` is in the list: `> show databases`
    * Switch to `dorkdb`: `> use dorkdb`
    * Ensure `games` and `players` tables exist: `> show collections`
    * If satisfied, then exit mongo command line: `> exit`
8. Run the app and see the prod data (see "Running" section below)
9. ???
10. Profit!

# Initial Local Heroku Setup
1. This will read from/write to the local Mongo database only. See step 5 to read from/write to remote databases.
2. Download the Heroku Toolbelt and install: https://toolbelt.heroku.com/
3. **Windows Only:** 
    * Make sure Heroku is installed to C:\heroku and mongo is installed to C:\mongodb instead of Program Files.
    * Ensure the paths to NPM, Node, and Heroku are registered as environment variables after installation of packages.
4. Open a command prompt, navigate to the Dork API working folder, and make sure the packages are installed by typing `npm install`
5. **Optional:** Grab the Heroku configuration file if you want to use the remote database instead of local (ref: https://devcenter.heroku.com/articles/config-vars)
    * Open a command prompt and navigate to working directory's root folder
    * Download the heroku config plugin by typing `heroku plugins:install git://github.com/ddollar/heroku-config.git`
    * After the plugin is installed, grab the dev config by typing `heroku config:pull --app dork-dev`
    * Add the `.env` file to `.gitignore`

# Git Heroku Setup

Please do **not** do anything that is not free. My card is attached to the account and I'll
discontinue service immediately if unexpected charges show up.

There is an app on Heroku for each environment.

# Files
* app.js - starting point. Update this when adding new routes
* routes - Has all controllers
* models - Has all mongodb models
* models/index.js - Update this when adding new models.
