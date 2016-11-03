/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var MasterData = require('../../models/masterOnce/index');
var response = require('../../constant/response');
var constant = require('../../constant/constant');

// define route
var route = new Route('get', '/data/allcountries');
module.exports = route;

/********************saving the countries data****************/

route.use(function (req, res, next) {
	var responseItem = {};
	MasterData.getAllCountriesSaveAll(function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
			responseItem = response.response(null, constant.messages.SERVERERROR, constant.statusCodes.SERVERERROR)

		}
		else {
			console.log("DONE!!!");
			console.log(result);
			responseItem = response.
				response(result,
					constant.messages.SUCCESS,
					constant.statusCodes.SUCCESS);

		}
		res.send(responseItem);
	});
});

/******************************************************************/