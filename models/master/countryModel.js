/*
	OBJECTIVE: TO CREATE COUNTRY STATE CITY 
			   MONGODB STARTS IN THIS PROJECT
			   KIND OF MASTER DATA
*/
"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;


var countrySchema=new Schema({
								name:String,
							});
var listAllCountries=new Schema({
								countries:[countrySchema]
								});							
var countries=mongoose.model('countries',listAllCountries);
module.exports=countries;