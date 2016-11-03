/*
	OBJECTIVE: TO CREATE COUNTRY STATE CITY 
			   MONGODB STARTS IN THIS PROJECT
			   KIND OF MASTER DATA
*/
"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;

var citySchema=new Schema({
								name:String,
								country_name:String,
								state_name:String
							});
var allCities=new Schema({
							cities:[citySchema]
						 });							
var cities=mongoose.model('cities',allCities);						 
module.exports=cities;