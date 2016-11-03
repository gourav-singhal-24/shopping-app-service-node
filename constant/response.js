var responseItem={}

module.exports=responseItem;

responseItem.response = function (data, message, status) {
	return {
		Data : data,
		Message : message,
		Status : status
	};
};