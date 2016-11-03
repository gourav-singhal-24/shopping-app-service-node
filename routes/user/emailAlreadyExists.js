/*
    OBJECTIVE: EMAIL ALREADY EXISTS OR NOT 
*/

var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');
var appUtils = require('../../libs/appUtils');
var Check = require('../../libs/core/Check');

// define route
var route = new Route('get','/user/exists');
module.exports = route;

//if it is needd that email is correct or not
route.use(function(req,res,next){
    console.log("first middleware");
    var email = req.query.Email;
    console.log(email);
    var rules = {
                email: Check.that(email).isEmail().isNotEmptyOrBlank() 
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
                responseItem = response
                    .response(null,
                        constant.messages.Already_Exists,
                        constant.statusCodes.SUCCESS);
                console.log("Exists..!!!")
            }
            else {
                responseItem = response
                    .response(null,
                            "Not Exists",
                        constant.statusCodes.SC_NOT_FOUND);
                console.log("Not Exists..!!!")
            }
        }
        res.json(responseItem);    
    });
});