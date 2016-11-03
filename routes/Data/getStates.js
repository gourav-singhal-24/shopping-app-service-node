/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var MasterData=require('../../models/master/index');
var constant=require('../../constant/constant');
var response=require('../../constant/response');

// define route
var route = new Route('get','/data/states');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	var country=req.query.country;
	var responseItem={};
	MasterData.getAllStates(country,function(err,result){
		console.log("callback.....");
		if(err) {
				console.log("Error due to %s",err);
				responseItem=response
							.response(null,constant.messages.ERROR,
									constant.statusCodes.SERVERERROR);
				}
		else{
			console.log(result);
			responseItem=response
							.response(result,constant.messages.SUCCESS,
									constant.statusCodes.SUCCESS);
		}		
			res.json(responseItem);
	})
});