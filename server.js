var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var passport = require('passport');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');

console.log('Connecting to database');
mongoose.connect('mongodb://' + process.env.IP, function(err) {
    if (err) {
        throw err;
    }
    console.log('Db open');
});

console.log('Setting generic routes');
var router = express.Router();
router.get('/', function(req, res) {
    res.json({ message: 'API Root'});
});

console.log('Setting user routes');
router.route('/users')
    .get(userController.list)
    .post(userController.create);

router.route('/users/:user_id')
	.delete(authController.isAuthenticated, userController.delete)
    .get(authController.isAuthenticated, userController.get)
	.put(authController.isAuthenticated, userController.update);

console.log('Setting middleware');
var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(passport.initialize());
app.use('/api', router);

// Listen
app.listen(process.env.PORT || 8080);
console.log('Listening');



