var express = require('express');
var slash = require("express-slash");
var cors = require('cors');
var errorhandler = require('errorhandler')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var passport = require('passport');
var userController = require('./controllers/user');
var authController = require('./auth/localStrategy');

console.log('Running on: ' + process.env.NODE_ENV);

console.log('Connecting to database');
var mongodb = process.env.MONGODB || 'localhost';
mongoose.connect('mongodb://' + mongodb, function(err) {
  if (err) {
    throw err;
  }
  console.log('Db open');
});

console.log('Setting routes');
var app = express();
app.enable('strict routing');

console.log('Setting api routes');
var apiRouter = express.Router({
  caseSensitive: app.get('case sensitive routing'),
  strict       : app.get('strict routing')
});

apiRouter.get('/api/', function(req, res) {
  res.json({ message: 'API Root'});
});

apiRouter.route('/api/users')
  .get(userController.list)
  .post(userController.create);

apiRouter.route('/api/users/:user_id')
  .delete(authController.isAuthenticated, userController.remove)
  .get(authController.isAuthenticated, userController.get)
  .put(authController.isAuthenticated, userController.update);

console.log('Setting client routes');
var clientRouter = express.Router({
  caseSensitive: app.get('case sensitive routing'),
  strict       : app.get('strict routing')
});

clientRouter.get('/client/', function(req, res) {
  res.render('index.ejs');
});

clientRouter.get('/client/login', function(req, res) {
  res.render('login.ejs', { message: '' });
});

clientRouter.get('/client/signup', function(req, res) {
  res.render('signup.ejs', { message: '' });
});

clientRouter.get('/client/profile', authController.isAuthenticated, function(req, res) {
  res.render('profile.ejs', {
    user : req.user
  });
});

clientRouter.get('/client/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

console.log('Setting middleware');
app.use(morgan('dev'));
app.use('/api', cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.set('view engine', 'ejs');
app.use(apiRouter);
app.use(clientRouter);
app.use(slash());

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

// Listen
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on: ' + port);