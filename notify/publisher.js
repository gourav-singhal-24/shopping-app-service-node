var emailNotifier = require('./emailNotifier');
var pushNotifier = require('./pushNotifier');
var smsNotifier = require('./smsNotifier');
var api_events = require('../assets/api_events');

// define module
var publisher = {};
module.exports = publisher;

/**
 * Send email/phone verification mail or sms.
 * @param {Object} verification - verification db node.
 */
publisher.verificationRequest = function (verification) {
    if (verification.type === 'email') {

        emailNotifier.sendEmail([verification.value],
            api_events.email_verification.event_code,
            {email: verification.value, code: verification.code});

    } else if (verification.type === 'phone') {

        smsNotifier.sendSMS([verification.value],
            api_events.phone_verification.event_code,
            {phone: verification.value, code: verification.code});

    }
};

/**
 * Send an email notification for password reset.
 * @param {Object} email - user email.
 * @param {String} newPass - new password.
 */
publisher.passwordReset = function (email, newPass) {
    emailNotifier.sendEmail([email],
        api_events.password_reset.event_code,
        {password: newPass});
};

/**
 * Send a welcome email for new user.
 * @param {Object} user - user object.
 */
publisher.newUser = function (user) {
    emailNotifier.sendEmail([user.email],
        api_events.user_registered.event_code,
        {name: user.first_name + ' ' + user.first_name});
};