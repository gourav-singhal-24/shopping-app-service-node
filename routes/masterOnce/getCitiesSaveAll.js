/*
	OBJECTIVE: INSERT ALL THE STATES	
*/

var Route = require('../../libs/core/Route');
var MasterData = require('../../models/masterOnce/index');
var constant = require('../../constant/constant');
var response = require('../../constant/response');
var appUtils = require('../../libs/appUtils');
var Check = require('../../libs/core/Check');

// define route
var route = new Route('get','/data/allcities');
module.exports = route;
/*******************Insert--Check--Here**********************/
route.use(function (req, res, next) {
	//var country = req.query.country;
	var state = req.query.state;
	var rules = {
        state: Check.that(state).isNotEmptyOrBlank(),
    };
    appUtils.validateChecks(rules, next);
});
/********************saving the countries data****************/
route.use(function (req, res, next) {
	var state = req.query.state;
	var responseItem = {}

	MasterData.getAllCitiesSaveAll(state, function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
			responseItem = response.response(null, constant.messages.SERVERERROR,
				constant.statusCodes.SERVERERROR);
		}
		else {
			console.log("DONE!!!");
			if (result[0] != undefined) {
				var cities = result[0].countries.data.data
				responseItem = response.response(cities, constant.messages.SUCCESS,
					constant.statusCodes.SUCCESS);
			}
			else{
				responseItem = response.response(null, constant.messages.NOT_FOUND,
				constant.statusCodes.SC_NOT_FOUND);
			}
		}
		res.json(responseItem);

	})
});
/******************************************************************/