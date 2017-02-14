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

//Init keys.
global.keys.dbName = "_Analytics";
global.keys.frontendServiceUrl = "https://service.cloudboost.io";
global.keys.apiNamespace = "API";
global.keys.userApiAnalyticsNamespace = "userApiAnalytics";
global.keys.userMonthlyApiNamespace = "userMonthlyApi";
global.keys.userStorageAnalyticsNamespace = "userStorageAnalytics";
global.keys.salesNameSpace = "sales";
global.keys.appPlansNamespace = "appPlans";
global.keys.notificationNamespace = "notifications";
global.keys.clustersNamespace = "clusters";

if(global.isDevelopment){
    global.keys.twoCheckout.sandbox=true;
    global.keys.frontendServiceUrl="http://localhost:3000";
}

var app = require('./app')();
app.set('port', process.env.PORT || 5555);
var server = app.listen(app.get('port'), function(){
    console.log("Analytics started running on PORT:"+app.get('port'));
});
