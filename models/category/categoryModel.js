/*
	OBJECTIVE: TO CREATE CATEGORY SCHEMA WITH SUB CATEGORIES
*/
"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;

var subCategory=new Schema({
							name:String,
							isActive:{type:Boolean ,default:true},
							isDeleted:{type:Boolean ,default:false}
						   });
var categorySchema=new Schema({
								name:{type:String,required:true},
								subCategories:[subCategory],
								isActive:{type:Boolean ,default:true},
								isDeleted:{type:Boolean ,default:false}
							});						   			
var categories=mongoose.model('categories',categorySchema);						 
module.exports=categories;