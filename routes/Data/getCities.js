/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var MasterData=require('../../models/master/index');
var constant=require('../../constant/constant');
var response=require('../../constant/response');

// define route
var route = new Route('get','/data/cities');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	var country=req.query.country;
	var state=req.query.state;
	var responseItem={}
	console.log(country);
	console.log(state);
	
	MasterData.getAllCities(country,state,function(err,result){
		if(err) {
				console.log("Error due to %s",err);
				responseItem=response.response(null,constant.messages.SERVERERROR,
										constant.statusCodes.SERVERERROR);
				}
		else{
			console.log("sent");
			responseItem=response.response(result,
										   constant.messages.SUCCESS,
										   constant.statusCodes.SUCCESS);
		}		
		res.json(responseItem);
	})
});