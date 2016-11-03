var ApiException = require('../libs/core/ApiException');
var apiErrors = require('../assets/api_errors');
var lodash = require('lodash');
var config = require('config');
var util = require('./core/utility');
var users = require('../models/users/index');
var constant = require('../constant/constant');

// define module
function authUtil() { }
module.exports = authUtil;

/**
 * Ensures there is a valid api_key in request headers or url query params.
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtil.verifyApiKey = function (req, res, next) {
    // get api_key from header or url query parameter if present
    var apiKey = req.get('api_key') || req.query.api_key;

    // api key must be provided
    if (apiKey === null || apiKey === undefined) {
        return next(ApiException.newUnauthorizedError(apiErrors.api_key_required.error_code, null));
    }

    // defined api keys
    var apiKeys = config.get('api_keys');

    //check for valid api_key
    /*******loadash any method???   *************/
    var valid = lodash.any(lodash.keys(apiKeys), function (ak) {
        var value = apiKeys[ak];
        if (value === apiKey) {
            req.client_type = ak;
            return true;
        } else {
            return false;
        }
    });

    if (valid) {
        return next();
    } else {
        return next(ApiException.newUnauthorizedError(apiErrors.invalid_api_key.error_code, null));
    }
};

/**
 * Ensures there is a valid auth_token in request headers or url query params.
 * @param req - express request.
 * @param res - express response.
 * @param next - express next.
 * @return {*}
 */
authUtil.verifyAuthToken = function (req, res, next) {

    var api_key=req.headers['api_key']||req.query.api_key;
    console.log("key");
    console.log(api_key);
    var Token = req.headers['auth_token']||req.query.auth_token;
    console.log("authToken");
    console.log(Token);
    console.log(req.headers);

    // auth_token must be provided
    if (Token === null || Token === undefined) {
        return next(ApiException.newUnauthorizedError(apiErrors.auth_token_required.error_code, null));
    }
    else {
        //match the token by finding it
        users.findByToken(Token, function (err, result) {
            /********************************/
            if (err) {
                console.log("Error due to :");
                console.log(err);
                return next(ApiException.newInternalError(null));
            }
            else {
                //that means --- unautorized to
                if (result === null) {
                    console.log(result);
                    console.log("token not matched");
                    console.log("unauthorized");
                    return next(ApiException.newUnauthorizedError(apiErrors.invalid_auth_token.error_code, null));
                }
                else {
                     console.log(result);
                    console.log("matched");
                    req.record=result;
                    req.TokenDate=result.TokenDate;
                    next();
                }
            }
            /**********************************/
        });
    }//outer-else-off
};
/****************************************************************/
authUtil.verifyAuthTokenTime = function (req, res, next) {
    
    console.log("....token matched check time.....");
    var latestTime=new Date();
    var timeInHrs=util.timeDifference(req.TokenDate,latestTime);
    if(timeInHrs<=constant.expire.Token){
        console.log("Token doesn't expires");
        next();
    }
    else{
        console.log("Token Expires");
        return next(ApiException.newUnauthorizedError(apiErrors.token_expire.error_code, null));
    }    
}