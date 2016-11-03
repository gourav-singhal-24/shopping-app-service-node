/*
	OBJECTIVE: INSERT ALL THE STATES
*/

var Route = require('../../libs/core/Route');
var States = require('../../constant/states');
var MasterData=require('../../models/master/index');


// define route
var route = new Route('post', '/save/states');
module.exports = route;

/********************saving the countries data****************/
route.use(function(req,res,next){
	console.log(States);
	MasterData.saveStates(States,function(err,result){
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