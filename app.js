var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

var User = require('./models/user');
var Schedule = require('./models/schedule');
var Availability = require('./models/availability');
var Candidate = require('./models/candidate');
var Comment = require('./models/comment');
var Member = require('./models/member');

var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'f8c95ebbc6b6fa61a013';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '8bd794919dcdcdd24775b01c97ab5e85b1fb1b3e';

passport.serializeUser(function (user,done){
    done(null,user)
});
passport.deserializeUser(function (obj,done){
    done(null,obj)
});

passport.use(new GitHubStrategy({
  clientID:GITHUB_CLIENT_ID,
  clientSecret:GITHUB_CLIENT_SECRET,
  callbackURL:process.env.HEROKU_URL ? process.env.HEROKU_URL + '/auth/github/callback' : 'http://localhost:8000/auth/github/callback'
},function (accessToken,refreshToken,profile,done){
   process.nextTick(function (){
     User.upsert({
       userId:profile.id,
       username:profile.username
     }).then(()=>{done(null,profile)})
   })
}));


User.sync().then(()=>{
  Schedule.belongsTo(User,{foreignKey:'createdBy'});
  Schedule.sync();
  Comment.belongsTo(User,{foreignKey:'userId'});
  Comment.sync();
  Member.belongsTo(User,{foreignKey:'hostId'});
  Member.sync();
  Availability.belongsTo(User,{foreignKey:'userId'});
  Candidate.sync().then(()=>{
    Availability.belongsTo(Candidate,{foreignKey:'candidateId'});
    Availability.sync();
  });
});




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var logoutRouter = require('./routes/logout');
var scheduleRouter = require('./routes/schedules');
var availRouter = require('./routes/availabilities');
var commentRouter = require('./routes/comments');
var enterRouter = require('./routes/enter');
var memoRouter = require('./routes/topmemo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use(session({ secret: 'e55be81b307c1c09', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/logout', logoutRouter);
app.use('/schedules',scheduleRouter);
app.use('/schedules',availRouter);
app.use('/schedules',commentRouter);
app.use('/enters',enterRouter);
app.use('/topmemo',memoRouter);


app.get('/auth/github',
  passport.authenticate('github',{scope:['user:email']}),
  function (req,res){});

app.get('/auth/github/callback',
  passport.authenticate('github',{failureRedirect:'/'}),
  function (req,res){
     res.redirect('/');
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
