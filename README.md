# Node - Robokassa

> This is node package for work with robokassa.ru API

### Installation

```sh
$ npm install robokassa
```

### Usage:
```javascript
var Robokassa = require('robokassa');
var  r = new Robokassa({login: "login", password: "pa$$w0rd"});
/*
* generate merchat link
* return https://auth.robokassa.ru/Merchant/Index.aspx?MrchLogin=.... .... .....
*/
r.merchantUrl({ id: "invoice number", summ: 500, description: "description of invoice"});
/*
* check payment 
* return true if success else return false
*/
r.checkPayment(req.params);
```

#### Example for express:

```javascript
express.get('/', function (req, res){
	link = r.merchantUrl({ id: "invoice number", summ: 500, description: "description"});
	res.render('index', { paymentLink: link});
});


express.get('/payment/result', function (req, res){
    if(r.checkPayment(req.params)){
        console.log("PAYMENT SUCCESS!");
    }else{
    	console.log("PAYMENT NOT SUCCESS!");
    }
});

express.get('/payment/true', function (req, res){
    res.render('payment_true');
});

express.get('/payment/false', function (req, res){
	res.render('payment_false');
});
```

### links

* [node.js](https://nodejs.org/) - evented I/O for the backend
* [Express](http://expressjs.com/api.html) - fast node.js network app framework [@tjholowaychuk]
* [robokassa.ru](http://www.robokassa.ru/ru/Doc/Ru/Interface.aspx) - Robokassa API
