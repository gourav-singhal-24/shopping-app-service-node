﻿/*
    OBJECTIVE: REGISTER THE USER AND SEND OTP ON ITS EMAIL
               ID 
*/
var Route = require('../../libs/core/Route');
var Check = require('../../libs/core/Check');
var bcrypt = require('bcrypt-nodejs');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var config = require('config');
var appUtils = require('../../libs/appUtils');
var constant = require('../../constant/constant.js');
var emailNotifier = require('../../notify/emailNotifier');
var shortid = require('shortid');


// define route
var route = new Route('post', '/user/register');
module.exports = route;
console.log("register.js file");
//Preliminary data type checks

route.use(function (req, res, next) {
    console.log("first middleware");
    var input = req.body;
    var Role = req.body.Role;
    var minPassLength = config.get('constraints.user_password_length');
    console.log(req.body);
    console.log(Role);
    var rules = {
        email: Check.that(input.Email).isEmail(),
        FirstName: Check.that(input.FirstName).isNotEmptyOrBlank(),
        LastName: Check.that(input.LastName).isNotEmptyOrBlank(),
        Password: Check.that(input.Password).isNotEmptyOrBlank().isLengthInRange(minPassLength, 256),
        Gender: Check.that(input.Gender).isOptional().isEnum(['male', 'female']),
        Role: Check.that(Role).isNotEmptyOrBlank().isEnum([constant.Role.ADMIN,constant.Role.SERVICE_PROVIDER,constant.Role.CUSTOMER])
    };
    appUtils.validateChecks(rules, next);
});

//Sanitize
route.use(function (req, res, next) {
    console.log("second middleware");
    var input = req.body;
    // Trim
    if (input.Email) {
        req.body.Email = input.Email.trim().toLowerCase();
    }
    if (input.FirstName) {
        req.body.FirstName = input.FirstName.trim();
    }
    if (input.LastName) {
        req.body.LastName = input.LastName.trim();
    }
    if (input.Password) {
        req.body.password = input.Password.trim();
    }
    if (input.Gender) {
        req.body.Gender = input.Gender.trim();
    }
    next();
});
/***************************************************/
// check if email already exist
route.use(function (req, res, next) {
    console.log("Third middleware");
    users.findOneForEmail(req.body.Email, function (err, records) {
        var data = records;
        console.log("records");
        console.log(records);
        if (err) {
            next(err);

        } else if (data) {
            console.log("email already Exist!!!");
            var responseItem = {
                Data: null,
                Message: constant.messages.Already_Exists,
                Status: constant.statusCodes.SC_BAD_REQUEST//400
            };
            res.json(responseItem);
        } else {
            console.log("all done (validation)");
            next();
        }
    });
});
/**************************************************/
//encrypt password
route.use(function (req, res, next) {
    console.log("fourth middleware");
    bcrypt.hash(req.body.Password, null, null, function (err, hash) {
        if (err) next(err);
        req.body.Password = hash;
        next();
    })
});
/*************************************************/
//Check filter conditions
route.use(function (req, res, next) {
    console.log("fifth middleware");
    var input = req.body;
    var date = new Date();
    //generating otp
    input.OTP = shortid.generate();
    console.log(input.Password);
    console.log(input.OTP);
    console.log("--------------");
    //Add conditions and input fields to response and proceed
    req.data = {
        Email: input.Email,
        FirstName: input.FirstName,
        LastName: input.LastName,
        Password: input.Password,
        Gender: input.Gender,
        OTP: input.OTP,
        OTPDate: date,
        DOC: date,
        Role: req.body.Role
    };
    next();
});
/****************************************************/
//fetch users detail(response) and save
route.use(function (req, res, next) {
    console.log("sixth middleware");
    users.saveUserData(req.data, function (err, record) {
        if (err) {
            console.log(err);
            next(err);
        }
        else {
            next();
        }
    });
});
/**********************************************************/
//send email if user sucessfully saved...
route.use(function (req, res, next) {
    var templateName = 'mail';
    console.log("seventh middleware");
    console.log("------------------");
    console.log(req.data.Email);
    var data = {
        name: req.body.FirstName,
        sender: "daffodilsw.com",
        OTP: req.data.OTP,
        page: "verify_youremail.com",
        msg: "To verifiy your account",
        Role: "Exists"
    }
    if(req.body.Role != constant.Role.CUSTOMER){
        data.Role=null;
    }
    console.log(data);
    var mailItem =
        {
            email: req.body.Email,//reciver email address 
            sender: constant.emailData.SENDER_EMAILID,//sender's name
            subject: constant.emailData.SIGNUP_SUBJECT,
            data: data
        };
    emailNotifier.emailTemplate(templateName, mailItem, function (err, result) {
        console.log("sending.....");
        var responseItem;
        if (err) {
            //DELETE THE ACCOUNT
            users.removeAccount(req.body.Email, function (err, result) {
                if (err) {
                    responseItem = {
                        Data: null,
                        Message: constant.messages.SERVERERROR,
                        Status: constant.statusCodes.SERVERERROR
                    };
                    console.log("email sent Failure!!!");
                }
                else {
                    console.log("deletion done");
                    responseItem = {
                        Data: null,
                        Message: constant.messages.ERROR,
                        Status: constant.statusCodes.FORBIDDEN_ERROR
                    }
                }
                res.json(responseItem);              
            });//removeAccount--close
        }//outer-if-close
        else {
            responseItem = {
                Data: null,
                Message: constant.messages.REGISTRATION_User,
                Status: constant.statusCodes.SUCCESS
            };
            console.log("email sent successfully!!!");
            res.json(responseItem);
        }//else-close
    });
});