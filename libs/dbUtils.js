/*
    OBJECTIVE: TO ESTBLISHES THE CONNECTION WITH MONGOOSE
*/
var config = require("config");
var mongoose =require('mongoose');

// First you need to create a connection to the mongo db
 var mongoDB = mongoose.connect(config.get("mongodb.url"),function(error,cb){

     if(error){
         console.log(error);
     }
     else {
         console.log("connected to db");
     }
 });
/********************************/
 
var dbUtils = {};

/**
 * Returns Mongo DB driver instance
 * @return {mongoose}
 */
dbUtils.getMongoDB = function(){
    return mongoDB;
};
module.exports = dbUtils;
