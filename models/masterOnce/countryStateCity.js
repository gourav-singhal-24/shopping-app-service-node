/*
	OBJECTIVE: TO CREATE COUNTRY STATE CITY 
			   MONGODB STARTS IN THIS PROJECT
			   KIND OF MASTER DATA
*/
"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;

		
			//may be it requires later
/*var  citySchema=new Schema({
							name:String,
						  });
var stateSchema=new Schema({
							name:{type:String,required:true},
							data:[citySchema]
						});


			//schema for one country
var countrySchema= new Schema({
							name:{type:String,required:true},
							data:[stateSchema]
						     });*/
							 
			//schema for n no of countries	
var listAllCountries=new Schema({
								countries:Array
								});					
	
var countries=mongoose.model('ListOfCountriesStatesCities',listAllCountries);
module.exports=countries;						
