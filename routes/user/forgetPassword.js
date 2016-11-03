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


// define route
var route = new Route('get', '/user/forgetpassword');
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
//check email exists or not
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
                //send mail on a link
/**************************************************************/                
                var templateName='passwordMail'    
                var data = {
                    name: record.FirstName,
                    sender: "daffodilsw.com",
                    page: "setyourpassword_youremail.com",
                    msg: "Don't worry we all forget our password sometimes!!"
                }
                var mailItem =
                    {
                        email: "sonali.rupela@daffodilsw.com",//reciver email address 
                        sender: "Accounts <dkdtesting7@gmail.com>",//sender's name
                        subject: "Test Email",
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


/*********************************************************/


            }
            else {
                responseItem = response
                    .response(null,
                        "Not Exists",
                        constant.statusCodes.SUCCESS);
                console.log("Not Exists..!!!")
                res.json(responseItem);
            }
        }
    });
});