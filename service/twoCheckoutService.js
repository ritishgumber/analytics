var uuid = require('uuid');


var Twocheckout = require('2checkout-node');
var tco = new Twocheckout({
  apiUser: global.keys.twoCheckout.apiUser,
  apiPass: global.keys.twoCheckout.apiPass,                                         
  sellerId: global.keys.twoCheckout.sellerId,                                    
  privateKey: global.keys.twoCheckout.privateKey,     
  sandbox: global.keys.twoCheckout.sandbox                                          
});

module.exports = {

     createSale : function(data,selectedPlan){
        
        var deferred= q.defer();        
       
        try{
          var merchantOrderId=uuid.v1();

  		    var params = {
              "merchantOrderId": merchantOrderId,
              "token": data.token.toString(),
              "currency": "USD",                                 
              "billingAddr": {
                  "name": data.billingAddr.name,
                  "addrLine1": data.billingAddr.addrLine1,
                  "addrLine2": data.billingAddr.addrLine2,
                  "city":  data.billingAddr.city,
                  "state": data.billingAddr.state,
                  "zipCode": data.billingAddr.zipCode,
                  "country": data.billingAddr.country,
                  "email":data.userEmail               
              },
              "lineItems":[{
                "type":"product",
                "name":selectedPlan.planName,
                "quantity":"1",
                "price":selectedPlan.price,                          
                "tangible":"N",
                "recurrence":"1 Month",
                "duration":"Forever",
                "startupFee":null              
              }]
          };     

          //Make the call using the authorization object and your callback function
      		tco.checkout.authorize(params, function (error, data) {
      		    if (error) {    		    			       
      		      deferred.reject(error);
      		    } else {                	
      		    	deferred.resolve(data);		        
      		    }
    		  });

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }
        
        return deferred.promise;
    },

    getSaleDetailsByInvoiceId : function(invoiceId){
        
      var deferred= q.defer(); 

      try{
        args = {
          invoice_id: invoiceId
        };

        tco.sales.retrieve(args, function (error, data) {
            if (error) {
              deferred.reject(error);  
            } else {
              deferred.resolve(data);  
            }
        });

      } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
      }
        
      return deferred.promise;
    },

    stopRecurring : function(lineItemId){
        
      var deferred= q.defer(); 

      try{
        args = {
          lineitem_id: lineItemId
        };

        tco.sales.stop(args, function (error, data) {
            if (error) {
              deferred.reject(error);
            } else {
              deferred.resolve(data);
            }
        });

      } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
      }
        
      return deferred.promise;
    },


};        