var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var url = require('url');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Configure MongoDB Connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "secretBook", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy');



// Set up facebook login
const fbOptions = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'name', 'gender', 'photos'],
  proxy: true
};

const fbCallback = function (accessToken, refreshToken, profile, cb) {
  console.log(accessToken, refreshToken, profile);
  User.findOrCreate(User, function (err, user) {
    if (err) { return done(err); }
    done(null, user);
  });
}

// For redirect after login
const storeRedirectToInSession = (req, res, next) => {
  let url_parts = url.parse(req.get('referer'));
  const redirectTo = url_parts.pathname;
  console.log(req.session);
  req.session.redirectTo = redirectTo;
  next();
};

passport.use(new FacebookStrategy(fbOptions, fbCallback));

app.route('/auth/facebook').get(storeRedirectToInSession, passport.authenticate('facebook', { scope: ['public_profile'] }));
app.route('/auth/facebook/callback').get(
  passport.authenticate('facebook', {
    failureRedirect: '../views/login'
  }), (req, res) => {
    logger.debug('Successful Authorization');
    res.redirect(req.session.redirectTo);
  }
);







app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
