/*				
	OBJECTIVE:UPDATE THE IMAGE (USER PROFILE)
						(CUSTOMER,SERVICE_PROVIDER,ADMIN) 
						ONLY ONE FILE UPLOAD AT A TIME
*/

//importing the modules
var Route = require('../../libs/core/Route');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');
var response = require('../../constant/response');
var config = require('config');
var constant = require('../../constant/constant.js');
var users = require('../../models/users/index');
var ApiException = require('../../libs/core/ApiException');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');


// define route
var route = new Route('put', '/user/profile/image');
module.exports = route;


//create the profile folder
route.use(function (req, res, next) {
	var dir = constant.root + 'profile';
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
//create the dir according to their Role
route.use(function (req, res, next) {

	var dir = constant.root + 'profile';
	console.log(dir);
	console.log(req.record.Role);
	var Role = req.record.Role;
	//admin
	if (Role === constant.Role.ADMIN) {
		dir = constant.root + 'profile/admin'
		console.log(dir);
	}
	//service provider
	else if (Role === constant.Role.SERVICE_PROVIDER) {
		dir = constant.root + 'profile/serviceProvider'
		console.log(dir);
	}
	//customer
	else {
		dir = constant.root + 'profile/customer'
		console.log(dir);
	}

	req.imgPath = dir + '/';
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
//rename the image
//and save it
route.use(function (req, res, next) {
	var path = req.imgPath;
	var form = new multiparty.Form({ uploadDir: path });
	/********************/
	// Errors may be emitted
	// Note that if you are listening to 'part' events, the same error may be
	// emitted from the `form` and the `part`.
	form.on('error', function (err) {
		console.log('Error parsing form: ' + err.stack);
		next(err);
	});
	// Parts are emitted when parsing the form
	form.on('part', function (part) {
		// You *must* act on the part by reading it
		// NOTE: if you want to ignore it, just call "part.resume()"

		if (!part.filename) {
			// filename is not defined when this is a field and not a file
			console.log('got field named ' + part.name);
			// ignore field's content
			part.resume();
		}

		if (part.filename) {
			// filename is defined when this is a file
			console.log(part.filename);
			console.log('got file named ' + part.filename);
			// ignore file's content here
			part.resume();
		}

		part.on('error', function (err) {
			// decide what to do
			next(err);
		});
	});
	/***********************/
	form.on('file', function (name, file) {
		var fileName = req.record._id;
		console.log(file);
		console.log(file.path);
		var tmp_path = file.path
		var target_path = path + fileName
		fs.renameSync(tmp_path, target_path, function (err) {
			if (err) {
				console.error(err.stack);
				next(err);
			}
			else {
				console.log("done");
				console.log("renamed");
			}
		});
	});
    /********************/
	form.parse(req);
	/*,
			this works or event form.on works
	 function ( err,fields, files) {
		console.log(path);
		console.log(fields);
		console.log(files);
		res.writeHead(200, { 'content-type': 'text/plain' });
		res.write('received upload:\n\n');
		res.end(util.inspect({ fields: fields, files: files }));
    });*/
	var responseItem = response.response(null,
		constant.messages.SUCCESS,
		constant.statusCodes.SUCCESS);
	res.json(responseItem);
});