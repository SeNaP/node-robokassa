var crypto = require('crypto');

module.exports = Robokassa;

function Robokassa(opts) {
	this.login = opts.login;
	this.pass1 = opts.password1;
	this.pass2 = opts.password2;
	this.hashType = opts.hash || 'md5';
	this.url = opts.url || 'https://auth.robokassa.ru/Merchant/Index.aspx';
}

Robokassa.prototype.merchantUrl = function(order) {
	/*
	 *  --- order data ---
	 * order.id
	 * order.description
	 * order.summ
	 * order.currency
	 * order.lang
	 *
	 */

	order.id = order.id || 0;

	var userParams = extractUserParams(order);
	var crcStr = [this.login, order.summ, order.id, this.pass1].join(':');
	var query = {
		MrchLogin: this.login,
		OutSum: order.summ,
		InvId: order.id,
		Desc: order.description
	};

	if (order.currency) query.sIncCurrLabel = order.currency;
	if (order.lang) query.sCulture = order.lang;

	if (userParams) {
		var keys = Object.keys(userParams).sort();

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			crcStr = crcStr + ':shp' + key + '=' + userParams[key];
			query['shp' + key] = userParams[key];
		}
	}

	query.SignatureValue = hash(crcStr, this.hashType);

	return this.url + '?' + queryStr(query);
};

Robokassa.prototype.checkPayment = function(req) {
	/*
	 *  --- check payment ---
	 * req.InvId
	 * req.SignatureValue
	 * req.OutSum
	 *
	 */

	var keys = Object.keys(req).sort();
	var userParams = [];
	var i;

	for (i = 0; i < keys.length; i++) {
		var key = keys[i];

		if (key.substring(0, 3) === 'shp') {
			userParams.push(key + '=' + req[key]);
		}
	}

	var crcOpts = [req.OutSum, req.InvId, this.pass2];

	if (userParams.length > 0) {
		for (i = 0; i < userParams.length; i++) {
			crcOpts.push(userParams[i]);
		}
	}

	var crc = hash(crcOpts.join(':'), this.hashType);
	return crc === req.SignatureValue.toLowerCase();
};

function hash(data, type) {
	return crypto.createHash(type || 'sha1')
		.update(data)
		.digest('hex');
}

function clone(obj) {
	if (null === obj || 'object' !== typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

function extractUserParams(order) {
	var params = clone(order);

	delete params.id;
	delete params.description;
	delete params.summ;
	delete params.currency;
	delete params.lang;

	if (Object.keys(params).length > 0) {
		return params;
	}
}

function queryStr(obj) {
	var ret = [],
		keys = Object.keys(obj),
		key;

	for (var i = 0, len = keys.length; i < len; ++i) {
		key = keys[i];
		if ('' === key) continue;
		ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
	}

	return ret.join('&');
}