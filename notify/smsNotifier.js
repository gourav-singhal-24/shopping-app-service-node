var config = require('config');
var logger = require('../libs/appUtils').logger;
var api_events = require('../assets/api_events');
var util = require('util');
var lodash = require('lodash');
var request = require('request');

// define module
var smsNotifier = {};
module.exports = smsNotifier;

//sms_gateway
var sms_gateway = config.get('sms_gateway');

//module constants
smsNotifier.REQUEST_OPTIONS = {
  url: sms_gateway.url,
  method: 'POST',
  qs: {
    api_key: sms_gateway.api_key,
    sender: sms_gateway.sender,
    format: sms_gateway.format,
    custom: sms_gateway.custom1 + ',' + sms_gateway.custom2,
    flash: sms_gateway.flash
  }
};

/**
 * Send a push notification to given push devices. The type of sms is to be conveyed by code,
 * and should be used to specify a corresponding message.
 * The data for the message is in the given payload.
 * @param {[String]} phones - an array of recipient phone numbers.
 * @param {String} code - sms type.
 * @param {Object} payload - sms data.
 */
smsNotifier.sendSMS = function(phones,code,payload){

  var receivers = phones.join(',');
  var message = resolveSMSContent(code, payload);

  var opts = lodash.assign({},smsNotifier.REQUEST_OPTIONS);
  lodash.assign(opts.qs,{to:receivers,message: message});

  request(opts,function (error) {
    if(error) {
        logger.error('SMS','Error sending sms',error);
    } else {
        logger.info('SMS','SMS sent to - ' + receivers + 'for event_code -' + code);
    }
  });
};

/**
 * Function to resolve sms type and data from given code and payload.
 * @param {String} code - sms type.
 * @param {Object} payload - sms data.
 */
function resolveSMSContent(code,payload){

    switch (code) {
      case api_events.phone_verification.event_code:
        return "Your phone verification code for Magwhere is " + payload.code;

      default:
        logger.error('SMS','Event_code not implmented');
    }
}
