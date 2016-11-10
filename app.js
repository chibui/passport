var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginapp'); //connecting to database
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var dashboard = require('./routes/dashboard');
var admindash = require('./routes/admindash');

//  Initialize app
var app = express();

//  View engine
app.set('views', path.join(__dirname, 'views')); // assigning 'views' folder to handle views
app.engine('handlebars', exphbs({defaultLayout:'layout'})); // set handlebars as layout engine
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // true = any type, false = string or array
app.use(cookieParser());

// Set static public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
    secret: 'secret', // Admin defined
    saveUninitialized: true,
    resave: true
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

// Global Vars for flash
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; //check if logged in
  next();
});

// Defining routes
app.use('/', routes);
app.use('/users', users);
app.use('/dashboard', dashboard);
app.use('/admindash', admindash);

// Set port number
app.set('port', (process.env.PORT || 3000));
// Set server to listen
app.listen(app.get('port'), function(){
  console.log('Server started on port ' +app.get('port'));
});