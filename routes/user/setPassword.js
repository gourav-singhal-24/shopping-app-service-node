/*
OBJECTIVE: SET THE PASSWORD 
			//null the otp
*/
var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');
var appUtils = require('../../libs/appUtils');
var Check = require('../../libs/core/Check');
var config = require('config');
var util = require('../../libs/core/utility.js');
// define route

var route = new Route('post', '/user/setpassword');
module.exports = route;

//get--the--email--and--password 
//check password length.
route.use(function (req, res, next) {
    console.log("first middleware");
    var input = req.body;
	console.log(req.body);
	
	console.log(input.OTP);
	console.log(input.Email);
	console.log(input.Password);
    
	var minPassLength = config.get('constraints.user_password_length');
	console.log(minPassLength);
	
    var rules = {
		email: Check.that(input.Email).isNotEmptyOrBlank().isEmail(),
		password: Check.that(input.Password).isNotEmptyOrBlank().isLengthInRange(minPassLength, 256),
		otp : Check.that(input.OTP).isNotEmptyOrBlank()
	}
	console.log(rules);
    appUtils.validateChecks(rules, next);
});
//record existence
route.use(function(req,res,next){
	var responseItem={};
	console.log("----second middleware----");	
	users.findOneForEmail(req.body.Email,function(err,record){
		if(err){
			console.log("Error occurred..");
			responseItem=response.response(null,
										   constant.messages.SERVERERROR,
										   constant.statusCodes.SERVERERROR);
			res.json(responseItem);									   			
		}
		//outer--else close
		else{
			console.log(record);
			if(record){
				req.record=record;
				console.log("record exists");
				next();
			}
			else{
				console.log("record is null");
			   responseItem=response.response(null,
										   constant.messages.NOT_FOUND,
										   constant.statusCodes.SC_NOT_FOUND);
			res.json(responseItem);
			}
		}//outer else close
	});
});
//verify the otp--otp matches or not
route.use(function(req,res,next){
	var sentOtp=req.body.OTP;
	var databaseOtp=req.record.OTP;
	var responseItem={};
	var isNotEqual=true;
	console.log("otp matcher middileware");
	console.log(databaseOtp);
	console.log(sentOtp);
	if(databaseOtp!=null)
	      isNotEqual = databaseOtp.localeCompare(sentOtp);
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
//verify the otp tym
route.use(function(req,res,next){
	
	var responseItem = {}
	console.log(req.record.OTPDate);
	console.log("-----otp-------");
	
	var date = new Date();
	var timeInHours = util.timeDifference(req.record.OTPDate, date);
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
			response(null,constant.messages.EXPIRE, constant.statusCodes.SC_BAD_REQUEST);
		res.json(responseItem);
		//otp time invalid
	}
	
});
//check account is verified or not only update password in case of verified user
//o/w third party hit this api and  changes the password
route.use(function(req,res,next){
	if(req.record.IsVerified){
		console.log("user is verified");
		next();
	}
	else{
		console.log("user is not verified");
		var responseItem={};
		responseItem=response.response(null,
									   constant.messages.FIRST_REGISTER,
									   constant.statusCodes.SC_BAD_REQUEST);
		res.json(responseItem);
	}
});
//update the password
route.use(function (req, res, next) {

	console.log("second middleware");
	var email = req.body.Email;
	var password = req.body.Password;
	var responseItem = {};
	users.findAndUpdatePassword(email, password, res, function (err, result) {

		if (err) {
			console.log(err);
			responseItem = {
				data: null,
				message: constant.messages.SERVERERROR,
				statuscode: constant.statusCodes.SERVERERROR
			}
		}
		//outer--else
		else {
			if (result) {
				console.log("Password Updated...");
				responseItem = {
					data: null,
					message: constant.messages.SUCCESS,
					statuscode: constant.statusCodes.SUCCESS
				}
			res.json(responseItem);		
			}
			else {
				responseItem = {
					data: null,
					message: constant.messages.NOT_FOUND,
					statuscode: constant.statusCodes.SC_BAD_REQUEST
				}
				res.json(responseItem);
			}
		}//outer-else
	});
});