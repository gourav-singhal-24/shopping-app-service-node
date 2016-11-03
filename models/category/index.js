/*
	OBJECTIVE:TO PERFORM THE OPERATIONS RELATED TO Master data
*/


var category = require('./categoryModel.js');

var categoryOperation = {};
module.exports = categoryOperation;

/****************saving the categories*******************/
categoryOperation.saveCategory = function (input, callback) {
	console.log(input);
	var data={
		name:input
	}
	category(data).save(callback);
}
/************category exist or not***************/
categoryOperation.findByCategory=function(categoryName,callback){
	console.log("find one method");
	console.log(categoryName);
	category.findOne({ name : categoryName }, callback);
}