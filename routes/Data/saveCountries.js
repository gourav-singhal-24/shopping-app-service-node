/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var Countries = require('../../constant/countries');
var MasterData=require('../../models/master/index');


// define route
var route = new Route('post', '/save/countries');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	MasterData.saveCountries(Countries,function(err,result){
		if(err) {
				console.log("Error due to %s",err);
				res.send("Error");
				}
		else{
			console.log(result);
			if(result!=undefined)
			res.send("Data has been saved!");
			else
			res.send("Data already exists! ");
		}		
	})
});