/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var MasterData=require('../../models/master/index');
var response=require('../../constant/response');
var constant=require('../../constant/constant');
// define route
var route = new Route('get','/data/countries');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	var responseItem={};
	MasterData.getAllCountries(function(err,result){
		if(err) {
				console.log("Error due to %s",err);
				responseItem=response.response(null,constant.messages.SERVERERROR,constant.statusCodes.SERVERERROR)
				}
		else{
			console.log(result);
			console.log("result printed....");
			responseItem=response.response(result,constant.messages.SUCCESS,constant.statusCodes.SUCCESS);	
			}		
			res.json(responseItem);
	})
});