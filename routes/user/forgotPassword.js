/*
OBJECTIVE: CREATE THE API FOR FORGET PASSWORD 
*/

var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');
var emailNotifier = require('../../notify/emailNotifier');
var shortid = require('shortid');

// define route
var route = new Route('get', '/user/forgotpassword');
module.exports = route;

//if it is needd that email is correct or not
route.use(function (req, res, next) {
    console.log("first middleware");
    var email = req.query.Email;
    console.log(email);
    var rules = {
        email: Check.that(email).isEmail().isNotEmptyOrBlank()
    };
    appUtils.validateChecks(rules, next);
});
//check email is Exists or not
route.use(function (req, res, next) {
    var responseItem = {}
    users.findOneForEmail(req.query.Email, function (err, record) {
        if (err) {
            responseItem = response.response(null, constant.messages.ERROR, constant.statusCodes.SERVERERROR);
            console.log("error occurred due to some technical problem");
            console.log(err);
        }
        else {
            //if-record-already-exists
            if (record) {
                console.log(record);
                req.record = record;
                next();
            }
            //if-email-doesn't exists
            else {
                responseItem = response
                    .response(null,
                        "Not Exists",
                        constant.statusCodes.SC_NOT_FOUND);
                console.log("Not Exists..!!!")
                res.json(responseItem);
            }
        }//outer else close
    });
});
// check the IsVerified field first
route.use(function (req, res, next) {
    var responseItem = {}
    if (req.record.IsVerified) next();
    else {
        responseItem = response.response(null,
            constant.messages.FIRST_REGISTER,
            constant.statusCodes.SC_BAD_REQUEST);
        res.json(responseItem);
    }

});
//generate otp
route.use(function (req, res, next) {
    var OTP = shortid.generate();
    req.OTP = OTP;
    var responseItem = {}
    //save otp in data base
    users.findOneAndUpdateOtp(OTP, req.query.Email, function (err, result) {
        if (err) {
            console.log("server error in otp updation");
            console.log(err);
            responseItem = response.response(null,
                constant.messages.SERVERERROR,
                constant.statusCodes.SERVERERROR);
            res.json(responseItem);
        }
        else {
            next();
        }

    });

});
//sent mail according to Role
route.use(function (req, res, next) {
    console.log("---sent----email---");
    var templateName = 'mail'
    var data = {
        name: req.record.FirstName,
        sender: "daffodilsw.com",
        OTP: req.OTP,
        page: "setyourpassword_youremail.com",
        msg: "Don't worry we all forget our password sometimes!",
        Role: "Exists"
    }
    if(req.record.Role != constant.Role.CUSTOMER){
        data.Role=null;
    }
    var mailItem =
        {
            email: req.record.Email,//reciver email address 
            sender: constant.emailData.SENDER_EMAILID,//sender's name
            subject: constant.emailData.FORGOT_PASSWORD_SUBJECT,
            data: data
        };
    emailNotifier.emailTemplate(templateName, mailItem, function (err, result) {
        console.log("sending.....");
        var responseItem;
        if (err) {
            responseItem = {
                Data: null,
                Message: constant.messages.MAILERROR,
                Status: constant.statusCodes.SC_BAD_REQUEST
            };
        }
        else {
            responseItem = {
                Data: null,
                Message: constant.messages.SUCCESS,
                Status: constant.statusCodes.SUCCESS
            };
        }
        res.json(responseItem);
    });
    /**********************Mail Sending Complete***********************************/
});//route.use--close