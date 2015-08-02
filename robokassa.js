var crypto = require('crypto');

module.exports = Robokassa;

function Robokassa(opts) {
	this.login = opts.login;
	this.pass1 = opts.password1;
	this.pass2 = opts.password2;
	this.hashType = opts.hash || 'md5';
	this.url = opts.url || 'https://auth.robokassa.ru/Merchant/Index.aspx';
	this.paramPrefix = opts.paramPrefix || '_';
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

	var userParams = extractUserParams(order, this.paramPrefix);
	var crcStr = [this.login, order.summ, order.id, this.pass1].join(':');
	var query = {
		MrchLogin: this.login,
		OutSum: order.summ,
		InvId: order.id,
		Desc: order.description
	};

	if (order.currency) query.OutSumCurrency = order.currency;
	if (order.lang) query.Culture = order.lang;

	if (userParams.length > 0) {
		for (var i = 0; i < userParams.length; i++) {
			var key = userParams[i];
			crcStr = crcStr + ':shp' + key + '=' + order[key];
			query['shp' + key] = order[key];
		}
	}

	query.SignatureValue = hash(crcStr, this.hashType);

	return this.url + '?' + queryStr(query);
};

Robokassa.prototype.checkPayment = function(req, userFirstPass) {
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
			var val = req[key];
			userParams.push(key + '=' + val);

			delete req[key];
			req[key.substring(3)] = val;
		}
	}

	var crcOpts = [req.OutSum, req.InvId, userFirstPass ? this.pass1 : this.pass2];

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

function extractUserParams(obj, prefix) {
	var result = [];
	var keys = Object.keys(obj);
	var key;

	for (var i = 0, len = keys.length; i < len; ++i) {
		key = keys[i];

		if (key.substring(0, prefix.length) === prefix) {
			result.push(key);
		}
	}

	return result;
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