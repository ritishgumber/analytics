try{//Load the configuration.
    global.config = require('./config/cloudboost');
}catch(e){
    //File not found. 
    global.config = null;
}

if(global.config){
    global.isDevelopment=true;
}else{
    global.isDevelopment=false;
}

global.q = require('q');
global.keys = require('./config/keys.js')();

if(global.isDevelopment){	
       
    global.keys.hostedSecureKey="0824ff47-252e-4828-8bfd-1feddb659b24";  

    global.keys.twoCheckout.apiUser="rtbathulasuper";
    global.keys.twoCheckout.apiPass="Harinathsir9#";
    global.keys.twoCheckout.sellerId="901307760";
    global.keys.twoCheckout.privateKey="4D33B4B4-6DC0-47D1-A642-436CECE51B8F";
    global.keys.twoCheckout.sandbox=true;

    global.keys.frontendServiceUrl="http://localhost:3000";   
}

var app = require('./app')();
app.set('port', process.env.PORT || 5555);
var server = app.listen(app.get('port'), function(){
    console.log("Analytics started running on PORT:"+app.get('port'));
});