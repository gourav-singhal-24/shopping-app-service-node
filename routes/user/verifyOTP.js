/*
	OBJECTIVE: VERIFY THE OTP
*/
var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response.js');
var constant = require('../../constant/constant.js');
var util = require('../../libs/core/utility.js');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');

// define route
var route = new Route('post', '/user/verifyotp');
module.exports = route;

//get otp --- and --- email
route.use(function (req, res, next) {
	req.otp = req.body.OTP;
	req.email = req.body.Email;
	console.log(req.email);
	next()
});
//check is Email is valid or not
route.use(function (req, res, next) {
	var rules = {
        email: Check.that(req.email).isNotEmptyOrBlank().isEmail(),
		otp:   Check.that(req.otp).isNotEmptyOrBlank()
    };
    appUtils.validateChecks(rules, next);

});
//check email --- is email exists or not
route.use(function (req, res, next) {
	users.findOneForEmail(req.email, function (err, record) {
		if (err) {
			console.log("is Email Exists error....");
			var error = response.response(null,
							constant.messages.SERVERERROR,
							constant.statusCodes.SERVERERROR);
			console.log(error);
			next(err);
		}
		else {
			if (record) {
				console.log(record);
				req.data = {
					OTP: record.OTP,
					OTPDate: record.OTPDate,
				};
				next();
			}
			else {
				var responseItem = response
					.response
					("email not exists",
					constant.messages.NOT_FOUND,
					constant.statusCodes.SC_NOT_FOUND);
				console.log(responseItem);
				res.json(responseItem);
			}
		}
	});
});


//check otp is matched or not
route.use(function (req, res, next) {
	var responseItem = {}
	var otp = req.otp;
	var sentOtp = req.data.OTP;//data is the record which we get it in previous middleware
	console.log("otp matcher middileware");
	console.log(otp);
	console.log(sentOtp);
	var isNotEqual = otp.localeCompare(sentOtp);
				//if otp is matched
	if (!isNotEqual) {
		console.log("otp matched now check the is otp is expires or not");
		next();
	}
	//if otp-not matched
	else {
		responseItem =
		response
			.response(null,
				constant.messages.OTP_INVALID,
				constant.statusCodes.SC_BAD_REQUEST);
		console.log("otp not matches");
		res.json(responseItem);
	}
});


//check otp is expires 	
route.use(function (req, res, next) {

	var responseItem = {}
	console.log(req.data.OTPDate);
	console.log("-----otp-------");
	console.log(req.otp);
	var date = new Date();
	var timeInHours = util.timeDifference(req.data.OTPDate, date);
	//time not expires
	if (timeInHours <= constant.expire.OTP) {
		console.log("chek otp tym.....")
		console.log(timeInHours);
		console.log(constant.expire.OTP);
		next();
	}
	else {
		console.log("Time Expires!!!");
		responseItem =
		response.
			response(null, constant.messages.EXPIRE, constant.statusCodes.SC_BAD_REQUEST);
		res.json(responseItem);
		//otp time invalid
	}
});

//update the field isVerified and send the response to the user
route.use(function (req, res, next) {
	var isUserVerified = true;
	var responseItem = {};
	//find by email and update the users isverified field //set  otp-null and otpDate -null
	users.findOneAndUpdateIsVerifiedSetNullOTPAndOTPDate(isUserVerified, req.email, function (err, result) {
		if (err) {
			console.log("data is not update");
			console.log("user not verified");
			console.log(err);
			responseItem = response.response(null,
				constant.messages.SERVERERROR,
				constant.statusCodes.SERVERERROR);
			next(err);
		}
				//otp valid
		else {
			console.log("user is now verified..");
			console.log("Done!");
			responseItem =
			response
				.response(null,
					constant.messages.OTP_VALID,
					constant.statusCodes.SUCCESS);
			res.json(responseItem);
		}
	});
});	