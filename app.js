var createError = require('http-errors');
var express = require('express');
var path = require('path');

// var cookieParser = require('cookie-parser');

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var studentsRouter = require('./routes/students');
var teachersRouter = require('./routes/teachers');

var session = require('express-session');
var app = express();
// 我们在设计每一个页面时，可能会存在共用的视图，在开发时，为了不重复编写代码，我们把共用的视图抽离出来，封装到一个公共的模板中（如：layout.ejs）,让每一个页面都“继承”layout.ejs中公共的视图。而ejs-mate模块就提供这个功能，类似的模块还有express-parital等，如果不想使用模块，还可以使用ejs模块中的include    npm install ejs-mate --save
var engine = require('ejs-mate');

// view engine setup
app.engine('ejs',engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 引进session
app.use(session({
  secret: 'stu-manage',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge:1000 *60 * 60 *3 }
}));

// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use(usersRouter);
app.use('/students',studentsRouter);
app.use('/teachers',teachersRouter);


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
