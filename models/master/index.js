/*
	OBJECTIVE:TO PERFORM THE OPERATIONS RELATED TO USERSMODEL  
*/

var cities = require('./cityModel.js');
var states = require('./stateModel.js');
var countries = require('./countryModel.js');


var masterData = {};
module.exports = masterData;

/****************saving the countries*******************/
masterData.saveCountries = function (input, callback) {
	countries.count({}, function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
		}
		else {
			console.log("No of record is:");
			console.log(result);
			if (result === 0) {
				//save our data.
				countries(input).save(callback);
			}
			else {
				callback();
				console.log("data already Exists");
			}
		}
	});
}
/***********************************************************/
//save all states
masterData.saveStates = function (input, callback) {
	console.log("save states function");
	states.count({}, function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
		}
		else {
			console.log("No of record is:");
			console.log(result);
			if (result === 0) {
				//save our data.
				states(input).save(callback);
			}
			else {
				callback();
				console.log("data already Exists");
			}
		}
	});
}
/*************************************************************/
//save cities
masterData.saveCities = function (input, callback) {
	console.log("save states function");
	cities.count({}, function (err, result) {
		if (err) {
			console.log("Error Occured %s", err);
		}
		else {
			console.log("No of record is:");
			console.log(result);
			if (result === 0) {
				//save our data.
				cities(input).save(callback);
			}
			else {
				callback();
				console.log("data already Exists");
			}
		}
	});
}
/*******************************************************/
/*
				RETERIVE ALL THE MASTER DATA 

*/
/****************** get all the countries ********************/
masterData.getAllCountries = function (callback) {
	var countriesName = { "countries.name": 1, "_id": 0 }
	countries.find({}, countriesName, callback)
}
/****************** get all the states ********************/
masterData.getAllStates = function(country,callback) {
	console.log("states......");
	states.aggregate(
					{ $unwind : "$states" },
					{$match : {"states.country_name" : country}},callback);
}
/****************** get all the cities ********************/
masterData.getAllCities = function (country,state,callback) {
	cities.aggregate(
					{ $unwind : "$cities" },
					{$match : {"cities.country_name" : country}},
					{$match : {"cities.state_name" : state}},callback);
}




