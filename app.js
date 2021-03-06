var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Config = require ('./config');
var conf = new Config();

var models = require('./models');

var routes = require('./routes/index');
var admin = require('./routes/admin');
var players = require('./routes/players');
var playerStats = require('./routes/playerStats');
var games = require('./routes/games');
var activeGames = require('./routes/activeGames');
var gameHistory = require('./routes/gameHistory');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.pretty = true;

// Database
console.info("DB Connecting to ", conf.MONGO_URI);
mongoose.connect(conf.MONGO_URI);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', admin);
app.use('/games', games);
app.use('/players', players);
app.use('/playerStats', playerStats);
app.use('/activeGames', activeGames);
app.use('/gameHistory', gameHistory);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
