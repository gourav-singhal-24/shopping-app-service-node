/*
	OBJECTIVE:TO CHECK WHETHER THE LOGIN USER IS AUTHORUZED OR NOT
			  WITH A VALID PASSWORD.
			  IF USER IS AUTHORIZED THEN SENT A TOKEN IN RESPONSE	
*/

var Route = require('../../libs/core/Route');
var Check = require('../../libs/core/Check');
var appUtils = require('../../libs/appUtils');
var response = require('../../constant/response');
var config = require('config');
var constant = require('../../constant/constant.js');
var users = require('../../models/users/index');
var bcrypt = require('bcrypt-nodejs');
var uuid =require('node-uuid');

// define route
var route = new Route('post', '/user/login');
module.exports = route;

//first check that these field are not empty..

route.use(function (req, res, next) {
    console.log("first middleware...");
    var input = req.body;
    console.log(req.body);
    var rules = {
        email: Check.that(input.Email).isNotEmptyOrBlank().isEmail(),
        Password: Check.that(input.Password).isNotEmptyOrBlank()
    };
    appUtils.validateChecks(rules, next);

});
/********************************************/
//get the record if exists.
route.use(function (req, res, next) {
    console.log("Second Middleware");
    var email = req.body.Email;
    var responseItem={};
    users.findOneForEmail(email, function (err, result) {
        if (err) {
            console.log("Internal server error");
            console.log(err);
            next(err);
        }
                //if-we-get-the-record
        else if(result){
                console.log(result);
                req.record=result;
                next();                
        }
            //if-we-not-get-the-record-that-means-user-not-registered
        else{
             responseItem = response
                    .response(null,
                        constant.messages.FIRST_REGISTER,
                        constant.statusCodes.SC_UNAUTHORIZED);
              res.json(responseItem);          
        }
    });
});
/***********************************************/
//first-check-is-user-is-verified
route.use(function(req,res,next){
    var record=req.record;
    var responseItem={};
    console.log("-----Third Middleware------");
    console.log(record);
    console.log(record.IsVerified);
    if(record.IsVerified){
        console.log("user, is verified");
        next();
    }
    else{
        console.log("user is not verified");
        responseItem=response.response(null,
                              constant.messages.FIRST_REGISTER,
                              constant.statusCodes.SC_BAD_REQUEST);
        res.json(responseItem);                    
    }
});
/*****************************************/
//matched the password
route.use(function(req,res,next){
    var record=req.record;
    var password=record.Password;
    var sentPassword=req.body.Password;
    var responseItem={};
    bcrypt.compare(sentPassword,password,function(err,result){
        if(err){
            console.log("error");
            console.log(err);
        }
        else{
            console.log("------result-------");
                    //result===true if password matched
                    //generated-the-token
                    
           if(result){
               console.log("Password Matched..");
               next();
           }
                    //if password not matched
           else{
               responseItem=response.response(null,
                            constant.messages.UNAUTHORIZED_USER,
                            constant.statusCodes.SC_UNAUTHORIZED);
               res.json(responseItem);             
           }
        }
    });
     
});

/******************************************/
//generated the token and save it into database
 route.use(function(req,res,next){
 var passwordToken=uuid.v4();  
 var responseItem;  
     console.log("generated token is...");
     console.log(passwordToken);
     users.findOneAndUpdateTokenAndTokenDate(passwordToken,req.record.Email,new Date(),function(err,result){
         if(err){
             console.log("Token Generated but not updated..!");
             responseItem=response.response(null,
                                    constant.messages.SERVERERROR,
                                    constant.statusCodes.SERVERERROR);
         }
         else{
             console.log("Token successfully updated");
             var data={
                 Token:passwordToken,
                 FirstName:result.FirstName,
                 LastName:result.LastName,
                 Email:result.Email,
                 Role:result.Role,
                 _id:result._id
             }
             responseItem=response.response(data,
                                    constant.messages.SUCCESS,
                                    constant.statusCodes.SUCCESS);
         }
         res.json(responseItem);                       
     });
 });
