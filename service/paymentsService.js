var _ = require('underscore');
var pricingPlans = require('../config/pricingPlans.js')();

module.exports ={

   
    createSale : function(appId,data){
        
        var _self = this;

        var deferred= q.defer();            
        
        var selectedPlan=_.first(_.where(pricingPlans.plans, {id: data.planId}));

        var errorMsg=_validateBillingDetails(data.billingAddr);


        if(!errorMsg){
            _self.stopRecurring(data.secureKey,appId,data.userId).then(function(recurringDoc){//Remove previous plan first

                return global.twoCheckoutService.createSale(data,selectedPlan);//create sale

            }).then(function(saleDocument){              

                if(saleDocument && saleDocument.response){

                    var saveSaleObj={
                        appId:appId,
                        userId:data.userId,
                        planId:selectedPlan.id,
                        planName:selectedPlan.planName,
                        merchantOrderId:saleDocument.response.transactionId,
                        invoiceId:saleDocument.response.transactionId,
                        saleId:saleDocument.response.orderNumber,
                        total:saleDocument.response.total,
                        responseMsg:saleDocument.response.responseMsg,
                        saleTimestamp: new Date().getTime()
                    };                  
                    
                    global.appPlansService.updatePlanId(data.secureKey,appId,selectedPlan.id);//update appPlan
                    return global.salesService.saveSale(saveSaleObj);//add document for records

                }else{
                    var failedRespDeffred= q.defer();
                    failedRespDeffred.reject("Failed to Purchase..Try again");
                    return failedRespDeffred.promise;
                }
                

            }).then(function(respData){                     
                deferred.resolve(respData);
            },function(error){
                deferred.reject(error);
            });
        }else{
            var errorObj={
                error:"Billing Details are not valid or missed",
                field:errorMsg
            };
            deferred.reject(errorObj);
        }

        return deferred.promise; 
    },

    stopRecurring : function(host,appId,userId){
        
        var _self = this;

        var deferred= q.defer();        


        global.salesService.getLatestSale(appId,userId).then(function(saleDocument){           
            if(saleDocument){
                return global.twoCheckoutService.getSaleDetailsByInvoiceId(saleDocument.invoiceId);
            }else{
                var nosaleDocDeffred= q.defer();
                nosaleDocDeffred.resolve(null);
                return nosaleDocDeffred.promise;
            }
        }).then(function(saleDetails){            
            if(saleDetails){

                //Sort in DESC order
                saleDetails.sale.invoices.sort(function(a,b){
                    var c = new Date(a.date_placed);
                    var d = new Date(b.date_placed);
                    return d-c;
                });                

                return global.twoCheckoutService.stopRecurring(saleDetails.sale.invoices[0].lineitems[0].lineitem_id);
            }else{
                var noSaleDetDeffred= q.defer();
                noSaleDetDeffred.resolve(null);
                return noSaleDetDeffred.promise;
            }
        }).then(function(data){ 

            var planId=1;//make it to 1
            return global.appPlansService.updatePlanId(host,appId,planId);//update appPlan with first plan          
            
        }).then(function(updatedPlan){
            deferred.resolve({message:"success"});
        },function(error){ 
            if(error && error.message && error.message=="Lineitem is not scheduled to recur."){
                deferred.resolve({message:"Lineitem is not scheduled to recur."});
            }else{
                deferred.reject(error);
            }           
            
        });

        return deferred.promise; 
    },        
};

function _validateBillingDetails(billing){
    var errorMsg=null;
    if(!billing.addrLine1){
      return "Address1 cannot be null";
    }

    if(billing.addrLine1 && billing.addrLine1.length>64){
      return "Address1 should not exceed 64 Chars";
    }

    if(!billing.city){
      return "City cannot be null";
    }

    if(billing.city && billing.city.length>64){
      return "City should not exceed 64 Chars";
    }

    if(!billing.state && billing.country && fieldsRequiredForCountries(billing.country)){
      return "State cannot be null for selected country";
    }

    if(billing.state && billing.state.length>64){
      return "State should not exceed 64 Chars";
    }

    if(!billing.zipCode && billing.country && fieldsRequiredForCountries(billing.country)){
      return "Zipcode cannot be null for selected country";
    }

    if(billing.zipCode && billing.zipCode.length>16){
      return "Zipcode should not exceed 16 Chars";
    }

    if(!billing.country || billing.country=="0"){
      return "Country cannot be null";
    }

    if(billing.country && billing.country.length>64){
      return "Country should not exceed 64 Chars";
    }

    if(!billing.addrLine2 && billing.country && (billing.country=="CHN" || billing.country=="JPN" || billing.country=="RUS")){
      return "Address2 cannot be null for selected country.";
    }

    return errorMsg;
}  

function fieldsRequiredForCountries(country){
    country=country.trim();
    if(country=="ARG" || country== "AUS" || country== "BGR" || country== "CAN" || country== "CHN" || country== "CYP" || country== "EGY" || country== "FRA" || country== "IND" || country== "IDN" || country== "ITA" || country== "JPN" || country== "MYS" || country==
     "MEX" || country== "NLD" || country== "PAN" || country== "PHL" || country== "POL" || country== "ROU" || country== "RUS" || country== "SRB" || country== "SGP" || country== "ZAF" || country== "ESP" || country== "SWE" || country== "THA" || country== "TUR" || country== "GBR" || country== "USA"){
      return true;
    }
    return false;
}