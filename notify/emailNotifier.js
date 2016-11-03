var config = require('config');
var logger = require('../libs/appUtils').logger;
var nodemailer = require('nodemailer');
var sendGridTransport = require('nodemailer-sendgrid-transport');
var fs = require('fs');
var _jade = require('jade');

// define module
var emailNotifier = {};
module.exports = emailNotifier;

/**
 * Send an email to given addresses. The type of email is to be conveyed by code,
 * and should be used to specify a corresponding template.
 * The data for the template is in the given mailItem.
 * @param {[String]} toAddresses - an array of recipient email addresses.
 * @param {String} code - email type.
 * @param {Object} mailItem - email data.
 */

emailNotifier.sendEmail = function (mailItem, callback) {

	var transporter = nodemailer.createTransport(sendGridTransport(config.mail));
  var mailOptions = {
    from: mailItem.sender,
    to: mailItem.email,
    subject: mailItem.subject,
    html: mailItem.html
		};
    console.log("send email....")
		transporter.sendMail(mailOptions, function (err, info) {

    if (err) {
      console.log("sendMailError");
      console.log(err)
      return callback(err);
    }
    else {
      console.log('email sent callback');
      return callback(null);
				}
		});


};
/***********************************************/

emailNotifier.emailTemplate = function (templateName, mailItem, callback) {
  // specify jade template to load
  console.log(mailItem);
  console.log(process.cwd());
  
  var template = process.cwd() + '/assets/'+templateName+'.jade';

  // get template from file system
  fs.readFile(template, 'utf8', function (err, file) {
    if (err) {
      //handle errors
      console.log('ERROR!');
      return callback(err);
    }
    else {
      console.log("else");
      //compile jade template into function
      var compiledTmpl = _jade.compile(file, { filename: template});
      console.log(mailItem.data.name);
      // set context to be used in template
      var context = {data:mailItem.data};

      // get html back as a string with the context applied;
      var html = compiledTmpl(context);
      mailItem.html = html;
      emailNotifier.sendEmail(mailItem, callback);
    }
  });
}
