var priceChart=require('../config/priceChart.js')();

module.exports = {

	store : function(host, appId, category, subCategory,sdk){
        
		var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
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
                deferred.resolve(doc);
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
    statisticsByAppId : function(appId,fromTime,category){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];        
        
        var query = {};
        query.appId = appId;

        if(category){
            query.category = category;
        }
        
        query.timestamp = {}; 
        if(!fromTime){  
            //Start from everymonth 1st    
            var fromTime = new Date();
            fromTime.setDate(1);
            fromTime.setHours(0);
            fromTime.setMinutes(0);
            fromTime.setSeconds(0);
            fromTime=new Date(fromTime).getTime();
        }  
        query.timestamp.$gt = fromTime;        

        pipeline.push({$match:query});                  


        var project1={
            $project: {
                "txnTime": {
                    "$add": [ new Date(0), "$timestamp" ]
                }
            }
        };
        pipeline.push(project1);

        var project2={
          "$project": {
            "day": {
              "$dateToString": {
                "format": "%Y-%m-%d",
                "date": "$txnTime"
              }
            }
          }
        };
        pipeline.push(project2);

        var group = {
            $group : {
                _id :"$day",                
                apiCount: { $sum: 1}                
            }  
        };        
        pipeline.push(group);        
      
        collection.aggregate(pipeline, function(err,docs){
            if(err) {
                console.log("Error in Getting per day count API");
                console.log(err);                
                deferred.reject(err);
            }else if(docs.length>0){
                deferred.resolve(_prepareResponse(docs));                
            }else{
                deferred.resolve(null);
            }
        });
        
        return deferred.promise;
    }
       
};


function _prepareResponse(dayCountList,category) {
    var categoryName=null;
    var totalCost=0;
    var totalApiCount=0;
    for(var i=0;i<dayCountList.length;++i){
        totalApiCount=totalApiCount+parseInt(dayCountList[i].apiCount)
    }
    totalCost=_processPricing(category,totalApiCount);

    categoryName=category;
    if(!category){
        categoryName="API";
    }

    var response={
        category:categoryName,
        totalApiCount:totalApiCount,
        totalCost:totalCost,
        usage:dayCountList
    };

    return response;
}

function _processPricing (category,totalApiCount) {
    if(!category){      
        var bucketsCount=Math.ceil(totalApiCount/priceChart.apiRequestBucket);
        return bucketsCount*priceChart.apiCost;        
    }
}


