/*
	OBJECTIVE:TO PERFORM THE OPERATIONS RELATED TO Master data
*/


var countriesStatesCities = require('./countryStateCity.js');

var masterData = {};
module.exports = masterData;


/*************************************************/
//save at once country[state[city]]
masterData.saveAtOnce = function (input, callback) {
	countriesStatesCities.count({}, function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
		}
		else {
			console.log("No of record is:");
			console.log(result);
			if (result === 0) {
				//save our data.
				console.log(input);
				countriesStatesCities(input).save(callback);
			}
			else {
				callback();
				console.log("data already Exists");
			}
		}
	});
}
/************************************************************/

//get countries country[state[city]]

masterData.getAllCountriesSaveAll = function (callback) {
	var countriesName = { "countries.name": 1, "_id": 0 }
	countriesStatesCities.find({}, countriesName,callback); 
}
/***********************************************************/
//get states by using schema country[state[city]]

masterData.getAllStatesSaveAll=function(country,callback){
	
	var stateName = {
		"_id": 0,
		"countries.name": 0,
		"countries._id": 0,
		"countries.code": 0,
		"countries.data.code": 0,
		"countries.data._id":0,
		"countries.data.data": 0,
		"countries": { "$elemMatch": { "name":country } }
	}
	/*
	Note: if we use 
						countries.data.name:1
				   then it shows the error of projection mixed inclusion or exclusion	
	*/
	countriesStatesCities.find({}, stateName, callback);


}


/***************************************************/
//get all cities
masterData.getAllCitiesSaveAll = function (state,callback) {
	console.log("cities");
	countriesStatesCities.aggregate(
					{ $unwind : "$countries" },
					//{$match : {"countries.name" :country}},
					{ $unwind : "$countries.data" },
					{$match : {"countries.data.name" : state}}
					,callback);
}