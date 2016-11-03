var constants = {
	statusCodes: {
		SUCCESS: 200,
		SERVERERROR: 500,
		MULTI_STATUS: 207,
		FORBIDDEN_ERROR: 407,
		SC_BAD_REQUEST:400,
		SC_UNAUTHORIZED:401,
		SC_FORBIDDEN:403,
		SC_NOT_FOUND:404
	},
	messages: {
		LOGIN_SUCCESSFULL: " User Login Successfully",
		LOGOUT_SUCCESSFULL:"Logout Successfully",
		Already_Exists: "Already Exists.",
		MULTI_STATUS_ERROR: "Multi status error",
		REGISTRATION_User: "User Registered",
		NOT_FOUND: "Not Found Error",
		OTP_VALID:"OTP Valid",
		OTP_INVALID:"OTP Invalid",
		OTP_RESEND:"OTP successfully resent",
		ERROR:"error occured",
		SERVERERROR:"server error",
		SUCCESS:"SUCCESS",
		EXPIRE:"Time Expires",
		MAILERROR:"Mail Sending Failure",
		FIRST_REGISTER:"User Not Registered Please Registered First or may be Registeration Incompleted",
		UNAUTHORIZED_USER:"Unauthorized User"
	},
	emailData: {
		SENDER_EMAILID: "Accounts <admin@daffodilsw.com>",
		SIGNUP_SUBJECT: "Account Verification",
		FORGOT_PASSWORD_SUBJECT: "Forgot Password",
		URL: "http://172.18.1.62:63333/#/",
		RESEND_OTP:"Resending the OTP"
	},
	expire: {
		OTP: 2,
		Token:3
	},
	api_url:[
    
	'/data/allcities',
    '/data/allstates',
    '/data/allcountries',
    '/data/saveall',
    
	'/data/cities',
    '/data/countries',
	'/save/countries',
    '/save/states',
    '/save/cities',
    
   	'/user/logout',
    '/user/register',
	'/user/verifyotp',
    '/user/resendotp',
    '/user/exists',
	'/user/login',
	'/user/forgotpassword',
	'/user/setpassword',
	],
	Role:{
		ADMIN: "0",
		SERVICE_PROVIDER:"1",
		CUSTOMER:"2"
	},
	root:['./images/']
}
module.exports = constants;