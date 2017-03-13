module.exports = function(){
    return {
       hostedSecureKey :"1227d1c4-1385-4d5f-ae73-23e99f74b006",
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
