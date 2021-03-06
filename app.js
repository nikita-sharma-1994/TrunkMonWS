var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//home page
var routes = require('./routes/index');
//services related to thresholds
var countries = require('./routes/thresholds/countries');
var divisions = require('./routes/thresholds/divisions');
var thresholds_get = require('./routes/thresholds/get');
var thresholds_push = require('./routes/thresholds/push');
var thresholds_delete = require('./routes/thresholds/delete');
//services related to violations
var freshness = require('./routes/violations/freshness');
var violations_get = require('./routes/violations/get');
var violations_pull = require('./routes/violations/pull');
var violations_push = require('./routes/violations/push');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//url paths related to thresholds
app.use('/thresholds/countries',countries);
app.use('/thresholds/divisions',divisions);
app.use('/thresholds/get',thresholds_get);
app.use('/thresholds/push',thresholds_push);
app.use('/thresholds/delete',thresholds_delete);
//url paths related to violations
app.use('/violations/freshness',freshness);
app.use('/violations/get',violations_get);
app.use('/violations/pull',violations_pull);
app.use('/violations/push',violations_push);

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
