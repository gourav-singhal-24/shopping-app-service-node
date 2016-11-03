/*
	OBJECTIVE: INSERT ALL THE COUNTRIES	
*/

var Route = require('../../libs/core/Route');
var Countries = require('../../constant/countries');
var MasterData=require('../../models/masterOnce/index');
var CountriesStatesCities=require('../../constant/countriesStatesCities');

// define route
var route = new Route('post', '/data/saveall');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	MasterData.saveAtOnce(CountriesStatesCities,function(err,result){
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