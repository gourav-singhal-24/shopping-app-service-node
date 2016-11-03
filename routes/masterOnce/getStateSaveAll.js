/*
	OBJECTIVE: INSERT ALL THE STATES	
*/

var Route = require('../../libs/core/Route');
var MasterData=require('../../models/masterOnce/index');
var constant=require('../../constant/constant');
var response=require('../../constant/response');
var appUtils = require('../../libs/appUtils');
var Check = require('../../libs/core/Check');

// define route
var route = new Route('get','/data/allstates');
module.exports = route;

/********************saving the countries data****************/

//check whether the country name is geted in query or not
route.use(function (req, res, next) {
    console.log("first middleware");
   var country = req.query.country;
    var rules = {
        country: Check.that(country).isNotEmptyOrBlank(),
    };
    appUtils.validateChecks(rules, next);
});

//get all the sate of a particular country
route.use(function(req,res,next){
	var country = req.query.country;
		var responseItem={};
	MasterData.getAllStatesSaveAll (country,function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
			responseItem=response
							.response(null,constant.messages.ERROR,
									constant.statusCodes.SERVERERROR);
		}
		else {
				
				if((result[0].countries)!=undefined)
				{
				var states=result[0].countries[0].data;
				console.log("DONE!!!");
				responseItem=response
							.response(states,constant.messages.SUCCESS,
									constant.statusCodes.SUCCESS);
				}
			else{
				responseItem=response
							.response(null,constant.messages.NOT_FOUND,
									constant.statusCodes.SC_NOT_FOUND);
			}
		}	
		res.json(responseItem);
	});
});
/******************************************************************/