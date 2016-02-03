var Twocheckout = require('2checkout-node');

// Pass in your private key and seller ID
var tco = new Twocheckout({
    apiUser: "APIuser1817037",                              // Admin API Username, required for Admin API bindings
    apiPass: "APIpass1817037",                              // Admin API Password, required for Admin API bindings
    sellerId: "1817037",                                    // Seller ID, required for all non Admin API bindings 
    privateKey: "3508079E-5383-44D4-BF69-DC619C0D9811",     // Payment API private key, required for checkout.authorize binding
    secretWord: "tango",                                    // Secret Word, required for response and notification checks
    demo: true,                                             // Set to true if testing response with demo sales
    sandbox: false                                          // Uses 2Checkout sandbox URL for all bindings
});

module.exports = {

     chargeCard : function(){
        
        var deferred= q.defer();        
       	
       	//Setup the authorization object
		var params = {
		    "merchantOrderId": "123",
		    "token": "MWQyYTI0ZmUtNjhiOS00NTIxLTgwY2MtODc3MWRlNmZjY2Jh",
		    "currency": "USD",
		    "total": "10.00",
		    "billingAddr": {
		        "name": "Testing Tester",
		        "addrLine1": "123 Test St",
		        "city": "Columbus",
		        "state": "Ohio",
		        "zipCode": "43123",
		        "country": "USA",
		        "email": "example@2co.com",
		        "phoneNumber": "5555555555"
		    }
		};

       	//Make the call using the authorization object and your callback function
		tco.checkout.authorize(params, function (error, data) {
		    if (error) {
		        console.log(error.message);
		    } else {
		        console.log(JSON.stringify(data));
		    }
		});
        
        return deferred.promise;
    },
};        