/*
	OBJECTIVE:TO PERFORM THE OPERATIONS RELATED TO USERSMODEL  
*/
var bcrypt = require('bcrypt-nodejs');
var userModel = require('./usersModel.js');
var users = {};
module.exports = users;

//check for email exists or not

users.findOneForEmail = function (checkEmail, callback) {
	console.log("finding......");
	userModel.findOne({ Email: checkEmail }, callback);
}

//save user data
users.saveUserData = function (input, callback) {
	console.log("saving...");
	userModel(input).save(callback);
}
//find one by email field and update the user value

users.findOneAndUpdateIsVerifiedSetNullOTPAndOTPDate = function (isUserVerified, email, callback) {
	console.log(isUserVerified);
	console.log(email);
	console.log("---find One And Update----");
	userModel.findOneAndUpdate({ Email: email }, { IsVerified: isUserVerified,OTP:null,OTPDate:null }, callback);

}

//find by email and update otp..
users.findOneAndUpdateOtp = function (newOTP, email, callback) {
	console.log(newOTP);
	console.log(email);
	console.log(new Date());
	console.log("---find One And Update----");
	userModel.findOneAndUpdate({ Email: email }, { OTP: newOTP, OTPDate: new Date() }, callback);
}

//store the Token
users.findOneAndUpdateTokenAndTokenDate = function (token, email, date, callback) {
	console.log(token);
	console.log(email);
	console.log("---find One And Update Token----");
	userModel.findOneAndUpdate({ Email: email }, { Token: token, TokenDate: date }, callback);
}

//update the password
users.findAndUpdatePassword = function (email, newPassword, res, callback) {
	console.log(email);
	console.log(newPassword);
	bcrypt.hash(newPassword, null, null, function (err, hash) {
        if (err) {
			console.log(err);
			res.json({
				data: null,
				message: "Error(server error) Password not saved!!",
				statuscode: 401
			});
		}
		else {
			console.log("find and update the password..");	
			//save the password
			userModel.findOneAndUpdate({ Email: email }, { Password: hash }, callback)

		}
    });
}
//remove the user account ------HARD DELETION
users.removeAccount = function (email, callback) {
	userModel.remove({ Email: email }, callback);
}

//search by token 
users.findByToken=function(token,callback){
	console.log("finding by token....");	
	userModel.findOne({ Token:token }, callback);
}

//update image
users.updateImage=function(id,img,callback){
	userModel.update({_id:id},{Img:img},callback);
}

