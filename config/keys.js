module.exports = function(){
    return {  
       hostedSecureKey :process.env['HOSTED_SECUREKEY'],
       logToken :process.env['LOG_TOKEN'],
       twoCheckout :{
        apiUser:process.env['TC_API_USER'],
        apiPass:process.env['TC_API_PASS'],
        sellerId:process.env['TC_SELLER_ID'],
        privateKey:process.env['TC_PRIVATE_KEY'],
        sandbox:false
       }
    };
};