module.exports = function(){
    return {
       hostedSecureKey :process.env['HOSTED_SECUREKEY'],
       logToken :"c064fc7e-4fc6-41e6-b51f-32c30deafdcc",
       twoCheckout :{
        apiUser:process.env['TC_API_USER'],
        apiPass:process.env['TC_API_PASS'],
        sellerId:process.env['TC_SELLER_ID'],
        privateKey:process.env['TC_PRIVATE_KEY'],
        sandbox:false
       }
    };
};
