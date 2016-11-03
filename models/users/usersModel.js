/*
	OBJECTIVE: TO CREATE THE SCHEMA FOR 
					1)CUSTOMER
					2)SERVICE_PROVIDER
					3)ADMIN
*/


"use strict";

var mongoose = require('../../libs/dbUtils').getMongoDB();
var Schema = mongoose.Schema;

			//category---with---price--schema
var categoryWithPrice=new Schema({
	Category:{type:String, required:true},
	Price:{type:Number,required:true}
});

var interestedCategories=new Schema({
							categories:Array	
							});

				//customer---service provider---admin
var userAdminSchema = new Schema({
	FirstName:String,
	LastName: String,
	ContactNo:Number,
	Country: String,
	City: String,
	Address:String,
	Email: String,
	Password:String,
	Gender:String,
	DOB:Date,	//date of birth

	OTP:String,
	OTPDate:Date,

	Token:String,
	TokenDate:Date,
	DOC:Date,	//date of creation
	IsVerified:{type:Boolean,default:false},
					//special-fields
	Role:String,
	InterestInCategory:[interestedCategories], //fill when customer register
	categoriesAndPrices:[categoryWithPrice] ,	//fill when service provider register 
	IsActive:{type:Boolean,default:true},
	IsDeleted:{type:Boolean,default:false},
	_image:String
});

var users=mongoose.model('user',userAdminSchema);
module.exports=users;

