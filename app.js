/*
OBJECTIVE:
*/
//on hold -- sanetize all
// require stuff
require('newrelic');
var express = require('express');
var config = require('config');
var lodash = require('lodash');
var docs = require('./docs');
var Route = require('./libs/core/Route');
var ApiException = require('./libs/core/ApiException');
var ErrorHandler = require('./libs/core/ErrorHandler');
var WhiteList = require('./libs/core/Whitelist');
var authUtil = require('./libs/authUtil');
var appUtils = require('./libs/appUtils');
var logger = require('./libs/logger');
var cors = require('cors');
var bodyParser = require('body-parser');
var path = require('path');
var constant=require('./constant/constant');


// init environment
var allowedEnv = ["development", "staging", "production"];

/*******why use this???********/
var env = config.util.getEnv('NODE_ENV');
if (lodash.contains(allowedEnv, env)) {
    console.info("NODE_ENV: %s", env);
} else {
    throw new Error(" Environment variable NODE_ENV must be one of [" + allowedEnv.join(",") + "]");
}
/******************/
// init app
var app = express();
app.locals.title = config.get("server.name");
app.locals.host = config.get("server.host");
app.locals.port = config.get("server.port");
app.locals.env = env;
app.locals.config = config;
// make the API Router and mount it on '/api' path.
var apiRouter = new express.Router();
app.use('/api',apiRouter); //line>?>
// enable CORS support
apiRouter.use(cors());

// serve docs on development
if(app.locals.env === 'development' || app.locals.env === 'staging') {
    docs.serve(apiRouter);/**********??? server (whole folder)******************/
}

// add api key verification for all routes
 apiRouter.use(authUtil.verifyApiKey);


// define white-listed routes
var whiteList = new WhiteList();/*******white list (not understand properly)**************/
whiteList.allow(constant.api_url);
// use auth token verification for all routes except for those allowed in white-list

whiteList.use(authUtil.verifyAuthToken); //token matching
whiteList.use(authUtil.verifyAuthTokenTime);//token time

apiRouter.use(whiteList.build());

// user json body parser
apiRouter.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
apiRouter.use(bodyParser.json({limit:'1000kb'}));


/**********************************/
// setup all other routes, and mount them on API router
Route.scanAll(path.join(__dirname,'routes'),true).forEach(function(route){
    route.mount(apiRouter);
});

// setup not found handler for requests un-served by any routes.
apiRouter.use(function(req,res,next){
    next(ApiException.newNotFoundError('Request not handled.'));
});

// setup error handling
var errorHandler = new ErrorHandler(logger);
apiRouter.use(errorHandler.build());


// print when online
app.on('online',function(){
    console.info("%s online at %s:%s",app.locals.title, app.locals.host, app.locals.port);
});

// start listening app and emit the 'online' event.
app.listen(app.locals.port,function(){app.emit('online');});

// export for testing purposes
module.exports = app;
