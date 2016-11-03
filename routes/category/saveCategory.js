/*
	OBJECTIVE: INSERT CATEGORY WITH IMAGES
*/

var Route = require('../../libs/core/Route');
var categoryOperation = require('../../models/category/index');
var constant = require('../../constant/constant');
var ApiException = require('../../libs/core/ApiException');
var apiErrors = require('../../assets/api_errors');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');
var response = require('../../constant/response');
// define route
var route = new Route('post', '/insert_category');
module.exports = route;
/************Check the Role only admin use this first**************/
route.use(function (req, res, next) {
	console.log("Token verified...!!");
	console.log("-------Role-------------");
	var Role = req.record.Role;
	if(Role === constant.Role.ADMIN)
	next();
	else{
		console.log("you are not admin..");
		return next(ApiException.newUnauthorizedError(apiErrors.invalid_operation.error_code, null));
	}
});
/*************************Category create ********************/
//get fields by through the form data
route.use(function (req, res, next) {
	var form = new multiparty.Form({ autoFields: true,uploadDir:'./images/temp/'});
	form.parse(req, function (err, fields, files) {
		if (err) {
			console.log("parsing error");
			next(err);
		}
		else {
			req.name = fields.name[0];
			console.log(req.name);
			console.log(files);
			console.log("path");
			console.log(files.category[0].path);
			req.temp_path=files.category[0].path;
			next();			
		}
	});//form-parsing
});
//check that category should not be saved previously
route.use(function (req, res, next) {
	console.log("second middleware");
	categoryOperation.findByCategory(req.name, function (err, result) {
		if (err) {
			console.log("Error occured on finding the category name");
			next(err);
		}
		else {
			//category already exists
			if (result) {
				var responseItem = response.response(null,
								constant.messages.Already_Exists,
					constant.statusCodes.SC_BAD_REQUEST);
				res.json(responseItem);
			}
			//category not exists
			else {
				console.log("found new category");
				next();
			}
		}//outer-else-close
	});//category-operation
});
//save category here
route.use(function (req, res, next) {
	categoryOperation.saveCategory(req.name, function (err, result) {
		if (err) {
			console.log("error occurred in category saving method");
			next(err);
		}
		else {
			req.result=result;
			console.log("data has been saved go for image saving.")
			next();
		}
	});//category-operation
});
/********************saving the image****************/
//create folder--for categories
route.use(function (req, res, next) {
	var dir = constant.root + 'categories';
	console.log(dir);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
		console.log("creating the directory...");
		next();
   	}
	else {
		console.log("directory already exists!!!");
		next();
	}
});
//create folder for particular category path=/images/categories/<category name>
route.use(function(req,res,next){

	var dir = constant.root + 'categories/'+req.name;
	req.imgPath=dir + '/';
	console.log(dir);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
		console.log("creating the directory...");
		next();
   	}
	else {
		console.log("directory already exists!!!");
		next();
	}
});
//save category image
route.use(function (req, res, next) {
	console.log(req.temp_path);
	var target_path = req.imgPath + req.result._id;
	console.log(target_path);
	//rename the file here
	fs.renameSync(req.temp_path, target_path, function (err) {
			if (err) {
				console.error(err.stack);
				next(err);
			}
			else {
				console.log("done");
				console.log("renamed");
			}
	});
	var responseItem=response.response(null,
									constant.messages.SUCCESS,
									constant.statusCodes.SUCCESS);
	res.json(responseItem);								
});
