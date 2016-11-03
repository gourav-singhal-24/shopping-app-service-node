/*
OBJECTIVE: LOGOUT THE USER ACCOUNT 
				1. EXPIRE THE TOKEN BY SETTING ITS VALUE NULL
					
*/

var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');
var emailNotifier = require('../../notify/emailNotifier');

// define route
var route = new Route('get', '/user/logout');
module.exports = route;

//if it is needd that email is correct or not
route.use(function (req, res, next) {
    console.log("first middleware");
    var email = req.query.Email;

    console.log(email);
    var rules = {
        email: Check.that(email).isEmail()
    };
    appUtils.validateChecks(rules, next);
});

//find the email
route.use(function (req, res, next) {
    var responseItem = {};
    console.log("second middleware");
    users.findOneForEmail(req.query.Email, function (err, result) {
        if (err) {
            console.log("Record Doesn't Exists");
            responseItem = response.response(null,
               
                constant.messages.SERVERERROR,
                constant.statusCodes.SERVERERROR);
            res.json(responseItem);
        }
        else {
            console.log("Record exist");
            req.record = result;
            next();
        }
    });
});
//Expires the Token and TokenDate
route.use(function (req, res, next) {
    var responseItem = {};
    users.findOneAndUpdateTokenAndTokenDate(null, req.query.Email, null, function (err, result) {
        if (err) {
            console.log("Token doesn't Expires....");
            responseItem = response.response(null,
                constant.messages.SERVERERROR,
                constant.statusCodes.SERVERERROR);
            res.json(responseItem);
        }
        else {
                 responseItem = response.response(null,
                constant.messages.LOGOUT_SUCCESSFULL,
                constant.statusCodes.SUCCESS);
            res.json(responseItem);
        }
    });
});