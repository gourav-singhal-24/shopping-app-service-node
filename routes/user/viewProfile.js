/*
OBJECTIVE: VIEW THE USER PROFILE
				SEND ALL THE DATA EXCEPT  
				PASSWORD
				TOKEN 
				OTP
				OTPDATE
				TOKENDATE
				ISDELETED
*/
var Route = require('../../libs/core/Route');
var users = require('../../models/users/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');
var appUtils = require('../../libs/appUtils');
var Check = require('../../libs/core/Check');
var config = require('config');



// define route
var route = new Route('get', '/user/view');
module.exports = route;

//check email field not empty and email format
route.use(function (req, res, next) {
	console.log("viewing the profile..");
	var input = req.query.Email;
	console.log(input);
	var rules = {
		email: Check.that(input).isNotEmptyOrBlank().isEmail()
	};
	appUtils.validateChecks(rules, next);
});

//sanatize
route.use(function (req, res, next) {
	var input = req.query.Email;
	if (input.Email) {
        input.Email = input.Email.trim().toLowerCase();
    }
	next();
});
//check the email exists or not
route.use(function (req, res, next) {
	users.findOneForEmail(req.query.Email, function (err, result) {
		var responseItem = {}
		if (err) {
			console.log(err);
			responseItem = response.response(null,
				constant.messages.SERVERERROR,
				constant.statusCodes.SERVERERROR);
		}
		else {
			console.log(result)
			/*
				check here also dat isDeleted is true or false
					if it is true then show dat record only			
			*/
			if (result) {
				//response send but only selected data
					var userDetail = {
							FirstName: result.FirstName,
							LastName: result.LastName,
							Email: result.Email,
							Gender: result.Gender,
						};

				if (result.Role) {
					userDetail.Role = result.Role;
				}
				if (result.DOB) {
					userDetail.DOB = result.DOB;
				}
				if (result.City) {
					userDetail.City = result.City;
				}
				if (result.Country) {
					userDetail.Country = result.Country;
				}
				if (result.Address) {
					userDetail.Address = result.Address;
				}
				if (result.ContactNo) {
					userDetail.ContactNo = result.ContactNo;
				}
				responseItem = response.response(userDetail,
					constant.messages.SUCCESS,
					constant.statusCodes.SUCCESS);
			}
			else {
				console.log("else");
				responseItem = response.response(null,
					constant.messages.NOT_FOUND,
					constant.statusCodes.SC_BAD_REQUEST);
			}
			/*correct from here*/

		}
		res.json(responseItem);
	});
}); 

