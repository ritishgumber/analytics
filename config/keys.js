module.exports = function(){
    return {
       mongodb : "mongodb://cbmongodb1.cloudapp.net/?replicaSet=cloudboost&slaveOk=true",       
       dbName : "_Analytics",
       hostedSecureKey : "0824ff47-252e-4828-8bfd-1feddb659b24",
       twoCheckout : {
        apiUser:"rtbathulasuper",
        apiPass:"Harinathsir9#",
        sellerId:"901307760",
        privateKey:"4D33B4B4-6DC0-47D1-A642-436CECE51B8F",
        sandbox:true
       },
       frontendServiceUrl:"http://localhost:3000",
       apiNamespace : "API",
       userApiAnalyticsNamespace : "userApiAnalytics",
       userMonthlyApiNamespace : "userMonthlyApi",
       userStorageAnalyticsNamespace : "userStorageAnalytics",
       clustersNamespace : "clusters",
       salesNamespace : "sales",
       appPlansNamespace : "appPlans",
       notificationNamespace : "notifications"
    };
};

