// Base Dependencies
var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

// Environment Modules
var languages = require('./modules/languages');
var environments = require('./modules/environments');

// Current Environment
var env = environments.select('localhost');
var lang = languages.select('nl-NL');

// Application Modules
var database = require('./modules/database');
var messaging = require('./modules/messaging');
var authentication = require('./modules/authentication');

// Configuration
app.configure(function(){
  app.set('port', env('APP_PORT'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(env('APP_COOKIE_SECRET')));
  app.use(express.session());

  languages.init(app);
  messaging.init(app);
  authentication.init(app);

  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express['static'](path.join(__dirname, 'public')));

  if (app.get('env') === 'development') {
    app.use(express.errorHandler());
  }
});

// Routes
require('./routes').init(app);

// Boot
database.open(function() {
  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});
