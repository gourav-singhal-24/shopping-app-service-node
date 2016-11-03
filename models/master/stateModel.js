/*
	OBJECTIVE: TO CREATE COUNTRY STATE CITY 
			   MONGODB STARTS IN THIS PROJECT
			   KIND OF MASTER DATA
*/
"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;

var stateSchema=new Schema({
								name:String,
								country_name:String
							});
var allStates=new Schema({
							states:[stateSchema]
						 });							
var states=mongoose.model('states',allStates);						 
module.exports=states;