var Twocheckout = require('2checkout-node');

var tco = new Twocheckout({                                         
  sellerId: global.keys.twoCheckout.sellerId,                                    
  privateKey: global.keys.twoCheckout.privateKey,     
  sandbox: global.keys.twoCheckout.sandbox                                          
});

module.exports = {

     createSale : function(data){
        
        var deferred= q.defer();        
       
		var params = {
            "merchantOrderId": "sjd",
            "token": data.token.toString(),
            "currency": "USD",                                 
            "billingAddr": {
                "name": "Joe Flagster",
                "addrLine1": "123 Main Street",
                "city": "Townsville",
                "state": "Ohio",
                "zipCode": "43206",
                "country": "USA",
                "email":"battu.network@gmail.com"               
            },
            "lineitems":[{
              "type":"product",
              "name":"launchPlan",
              "quantity":"1",
              "price":"10.00", 
              "productId":"launchplan",             
              "tangible":"N",
              "recurrence":"1 Month",
              "duration":"1 Year",
              "startupFee":null              
            }]
        };

       	//Make the call using the authorization object and your callback function
		tco.checkout.authorize(params, function (error, data) {
		    if (error) {
		    	console.log(error);		       
		        deferred.reject(error);
		    } else {
		    	console.log(data);
		    	deferred.resolve(data);		        
		    }
		});
        
        return deferred.promise;
    },
};        