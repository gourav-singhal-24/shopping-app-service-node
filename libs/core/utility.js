var fs = require('fs');
var uscore = require('underscore');
var constant = require('../../constant/constant');
var users = require('../../models/users/index');
var response = require('../../constant/response');

var util = {};
module.exports = util;

util.getHtml = function (filePath, model) {
	if (!filePath) {
		//TODO:log error
		return;
	}

	var html = fs.readFileSync(filePath, encoding = 'utf8');
	var template = uscore.template(html);
	return template(model);
};


util.timeDifference = function (currentDate, tokenExpiryDate) {
	var difference = currentDate.getTime() - tokenExpiryDate.getTime();
	var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
	difference -= hoursDifference * 1000 * 60 * 60;
	console.log("--hours difference---");
	console.log(hoursDifference);
	return Math.abs(hoursDifference);
};
