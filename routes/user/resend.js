/*
OBJECTIVE: RESEND THE OTP
				IF	 
					1) TIME IS NOT EXPIRES THEN SEND PREVIOUS ONE 
				ELSE
					2) ELSE GENERATE AND SEND THE OTP
*/
var Route = require('../../libs/core/Route');
var ApiException = require('../../libs/core/ApiException');
var api_errors = require('../../assets/api_errors');
var response = require('../../constant/response');
var emailNotifier = require('../../notify/emailNotifier');
var users = require('../../models/users/index');
var util = require('../../libs/core/utility');
var shortid = require('shortid');
var constant = require('../../constant/constant');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');


// define route
var route = new Route('post', '/user/resendotp');
module.exports = route;

//--get email and chect is it valid or not
route.use(function (req, res, next) {

	var rules = {
        email: Check.that(req.body.Email).isNotEmptyOrBlank().isEmail(),
    };
    appUtils.validateChecks(rules, next);

});
/********************************************************************/
//check time expires or not
/*
		get otp creation time by email
*/
route.use(function (req, res, next) {
	var email = req.body.Email;
	var responseItem={};
	console.log(email);
	req.date = new Date();
	users.findOneForEmail(email, function (err, record) {
		if (err) {
			console.log("find one by email occurs an error...");
			console.log(err);
			next(err);
		}
		else {
				console.log("record");
				console.log(record);
			if (record === null) {
					responseItem=response.response(null,
										constant.messages.NOT_FOUND,
										constant.statusCodes.SC_NOT_FOUND);
				res.json(responseItem);						
			}
			else {
				console.log("record printing...");
				console.log(record);
				req.record = record;
				next();
			}
		}
	});//find email			
});
/***********************************************************************/
//check expires----here
/*
		compare and checks expires in below middleware....
*/
route.use(function (req, res, next) {
	var timeInHours = util.timeDifference(req.record.OTPDate, req.date);
	//if time not expires...		
	//validation of otp	
	if (timeInHours <= constant.expire.OTP) {
		console.log("check otp tym.....")
		console.log(timeInHours);
		console.log(constant.expire.OTP);
		next();
	}
	//if otp time invalid 
	//generate again a new otp and send it
	//save new otp + OTP Time
	else {
		console.log("Time Expires!!!");
		var newOtp = shortid.generate();
		req.record.OTP = newOtp;
		//updating new otp
		users.findOneAndUpdateOtp(newOtp, req.record.Email, function (err, result) {
			if (err) {
				console.log("otp is not updated due to some technical problem...");
				console.log(err);
				next(err);
			}
			else {
				console.log("otp updated otpDate");
				next();
			}
		})
	}
});
/*******************************************************************/
/*
Send otp to given email id
*/
route.use(function (req, res, next) {

	console.log(req.record);
	var templateName = 'mail';
	var data = {
        name: req.record.FirstName,
        sender: constant.emailData.SENDER_EMAILID,
        OTP: req.record.OTP,
        page: "verify_youremail.com",
		msg: "Resend OTP",
		Role: "Exists"
    }
	
	 if(req.record.Role === "2"){
        data.Role=null;
    }
	
    var mailItem =
        {
            email: req.record.Email,	//reciver email address 
            sender: constant.emailData.SENDER_EMAILID,//sender's name
            subject: constant.emailData.RESEND_OTP,
            data: data
        };
    emailNotifier.emailTemplate(templateName, mailItem, function (err, result) {
		console.log("sending.Mail....");
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
				Message: constant.messages.OTP_RESEND,
				Status: constant.statusCodes.SUCCESS
			};
		}
		res.json(responseItem);
    });
});