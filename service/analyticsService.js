var _ = require('underscore');
var pricingPlans = require('../config/pricingPlans.js')();

module.exports = {

    store : function(host, appId, category, subCategory,sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        category=category.trim();
        subCategory=subCategory.trim();

        var document = {
          host : host,
          appId : appId, 
          category : category, 
          subCategory : subCategory,
          timestamp : new Date().getTime(),
          sdk : sdk
        };
        
        collection.save(document,function(err,doc){
            if(err) {
                console.log("Error while saving API");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log('++++ Object Updated +++');              

                //Update UserApi Day and Monthly wise
                global.userApiAnalyticsService.addRecord(host, appId);                 
                global.userMonthlyApiService.addRecord(host, appId);

                _checkAppLimit(host,appId).then(function(response){
                    deferred.resolve(response);
                },function(error){
                    console.log("App Check Limit error");
                    console.log(error);
                    
                    deferred.resolve({limitExceeded:false,message:"Okay"});
                });              
            }
        });
        
        return deferred.promise;
    },

    totalApiCount : function(host, appId, category, subCategory, fromTime, toTime,sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var query = {};
        
        if(host)
            query.host = host;
        if(appId)
            query.appId = appId;
        if(category)
            query.category = category;
        if(subCategory)
            query.subCategory = subCategory;

        if(sdk)
            query.sdk = sdk;
            
        if(fromTime || toTime){
            
            query.timestamp = {};
            
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lte = Number(toTime);
            }
        }
            
        collection.count(query, function(err,count){
            if(err) {
                console.log("Error in counting API");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log('COUNT : '+count);
                deferred.resolve(count);
            }
        });
        
        return deferred.promise;
    },
    
    activeAppWithAPICount : function(fromTime, toTime, limit, skip, sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];
        
        //add filters. 
        if(fromTime || toTime || sdk){
            var query = {};
            query.timestamp = {};
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }
            
            if(sdk)
                query.sdk = sdk;
            pipeline.push({$match:query});
        }
        
        //group.
        var group = {
          $group : {
                _id : "$appId",
                apiCount: { $sum: 1}
            }  
        };
        
        pipeline.push(group);
        
       
        pipeline.push({$sort : {apiCount : -1}});
        
        
        if(skip){
            pipeline.push({$skip : Number(skip)});
        }
        
        if(limit){
            pipeline.push({$limit : Number(limit)});
        }
        
      
        collection.aggregate(pipeline, function(err,docs){
            if(err) {
                console.log("Error in counting API");
                console.log(err);
                
                //underscore query
                
                deferred.reject(err);
            }else{
                console.log("Documents Retrieved.");
                
                //change _id to appId
                for(var i=0;i<docs.length;i++){
                    docs[i].appId = docs[i]._id;
                    delete docs[i]._id;
                }
                
                deferred.resolve(docs);
            }
        });
        
        return deferred.promise;
    },
    
    activeAppCount : function(fromTime, toTime,sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        //add filters. 
        var query = {};
        if(fromTime || toTime || sdk){
            
            query.timestamp = {};
            
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }

             if(sdk)
                query.sdk = sdk;
        }
        
        collection.distinct("appId", query, function(err,docs){
            if(err) {
                console.log("Error in counting API");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log("Count : "+docs.length);
                deferred.resolve(docs.length);
            }
        });
        
        return deferred.promise;
    },

    funnelAppCount : function(fromTime, toTime,apiCount,sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];

        //add filters. 
        var query = {};
        if(fromTime || toTime || sdk){
            
            query.timestamp = {};
            
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }

            if(sdk)
               query.sdk = sdk;

            pipeline.push({$match : query});
        }
        
       //group.
        var group = {
          $group : {
                _id : "$appId",
                apiCount: { $sum: 1}
            }  
        };
        
        pipeline.push(group);
        
       
        console.log(apiCount);

        pipeline.push({$match : {apiCount :{$gte:apiCount}}});
        
      
        collection.aggregate(pipeline, function(err,docs){
            if(err) {
                console.log("Error in counting API");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log("Documents Retrieved."); 
                deferred.resolve(docs.length);
            }
        });
        
        return deferred.promise;
    },
    
    categoryWithApiCount : function(fromTime, toTime, sdk){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];
        
        //add filters
        if(fromTime || toTime || sdk){
            var query = {};
            query.timestamp = {};
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }

            if(sdk)
              query.sdk = sdk;
            
            pipeline.push({$match:query});
        }
        
        //group.
        var group = {
          $group : {
                _id : "$category",
                apiCount: { $sum: 1}
            }  
        };
        
        pipeline.push(group);
      
        collection.aggregate(pipeline, function(err,docs){
            if(err) {
                console.log("Error in counting API");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log("Documents Retrieved.");
                
                 //change _id to appId
                for(var i=0;i<docs.length;i++){
                    docs[i].category = docs[i]._id;
                    delete docs[i]._id;
                }
                
                deferred.resolve(docs);
            }
        });
        
        return deferred.promise;
    },
    distinctApps : function(){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);        
         
        collection.distinct("appId",function(err,docList){
            if(err) {
                console.log("Error getting distinct AppIds");
                console.log(err);
                deferred.reject(err);
            }else{
                console.log('++++ Object Updated +++');
                deferred.resolve(docList);
            }
        });
        
        return deferred.promise;
    }  
    
       
};


function _checkAppLimit(host,appId){  
    var deferred= q.defer();

    global.appPlansService.upsertAppPlan(host,appId,null).then(function(appPlanDoc){        
        
        var promises=[];

        //API calls 
        promises.push(global.userMonthlyApiService.monthlyApiByAppId(appPlanDoc.host,appPlanDoc.appId,null));
        //Storage 
        promises.push(global.userStorageAnalyticsService.monthlyAnalyticsByAppId(appPlanDoc.host,appPlanDoc.appId,null));

        q.all(promises).then(function(list){ 
            var apiCalls=0;
            var storage=0;
            var connections=0
            var boost=0;

            if(list[0] && list[0].monthlyApiCount){
                apiCalls=list[0].monthlyApiCount;
            }
            if(list[1] && list[1].totalStorage){
                storage=list[1].totalStorage;
            }

            //var connections=list[0].monthlyApiCount;
            //var boost=list[0].monthlyApiCount;

            deferred.resolve(_checkLimitExceeded(appPlanDoc.planId,apiCalls,storage)); 
            

        }, function(err){    
            deferred.resolve(err);
        });


    },function(error){
        deferred.resolve(error);
    });

    return deferred.promise;
}

function _checkLimitExceeded(planId,apiCalls,storage){

    var currentPlan=_.first(_.where(pricingPlans.plans, {id: planId}));

    if(apiCalls!=0){
       if(apiCalls>currentPlan.apiCalls){
            return {limitExceeded:true,message:"API Calls limit exceeded "+currentPlan.apiCalls+" for "+currentPlan.planName};
        } 
    }    

    if(storage!=0){
        storage=(storage/1024);
        if(storage>currentPlan.storage){
            return {limitExceeded:true,message:"Storage limit exceeded "+currentPlan.storage+"(GB) for "+currentPlan.planName};
        }
    }    

    return {limitExceeded:false,message:"Okay"};
}