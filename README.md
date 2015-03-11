# Robokassa



## Installation


### [Node.js](http://nodejs.org/):

```
npm install robokassa
```

## Usage

~~~ javascript
var Robokassa = require('robokassa');
var  r = new Robokassa({login: "login", password: "password"});

r.merchantUrl({ id: 1, summ: '1200', description: 'product description'}); // retrun payment url link on robokassa 

r.checkPayment(req); //retrun true if success else false
~~~

Example for express

~~~ javascript

express.get('/product/:id', function (req, res){
	link = r.merchantUrl({ id: req.params.id, summ: '1200', description: 'product description' });
	res.render('index', { paymentLink: link});
});

express.get('/payment/result', function(req, res){
	if(r.checkPayment(req)){
		message = "Success";
	}else{
		message = "Fail";
	}

	res.render('payment_result', { msg: message});
});

~~~