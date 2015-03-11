var md5 = require('MD5');

var Robokassa = function (configuration) {
	/*
	*  --- your registration data ---
	* configuration.login1	 
	* configuration.password1
	*
	*/

	this.login1 = configuration.login;      // your login here
	this.pass1  = configuration.password;   // merchant pass1 here

	this.url 	= "https://auth.robokassa.ru/Merchant/Index.aspx";
};

Robokassa.prototype.merchantUrl = function(order){
	/*
	*  --- order data ---
	* order.id
	* order.description
	* order.summ
	*
	*/

	this.inv_id 	= order.id;
	this.inv_desc 	= order.description;
	this.out_summ 	= order.summ;

	this.crc 		= md5(this.login1+":"+this.out_summ+":"+this.inv_id+":"+this.pass1);

	result_url 		= this.url+"?MrchLogin="+this.login1+"&OutSum="+this.out_summ+"&InvId="+this.inv_id+"&Desc="+this.inv_desc+"&SignatureValue="+this.crc;	 

	return result_url;
};

Robokassa.prototype.checkPayment = function(req){
	/*
	*  --- check payment ---
	* req.params.InvId
	* req.params.SignatureValue
	* req.params.OutSum
	*
	*/

	if(this.crc != req.params.SignatureValue)
		return false
	else
		return true;
};

module.exports = Robokassa;