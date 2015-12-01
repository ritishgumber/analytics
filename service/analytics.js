module.exports = {

	store : function(host, appId, category, subCategory){
        
		var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var document = {
          host : host,
          appId : appId, 
          category : category, 
          subCategory : subCategory,
          timestamp : new Date().getTime()
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
    
    totalApiCount : function(host, appId, category, subCategory, fromTime, toTime){
        
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
    
    activeAppWithAPICount : function(fromTime, toTime, limit, skip){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];
        
        //add filters. 
        if(fromTime || toTime){
            var query = {};
            query.timestamp = {};
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }
            
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
    
    activeAppCount : function(fromTime, toTime){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        //add filters. 
        var query = {};
        if(fromTime || toTime){
            
            query.timestamp = {};
            
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }
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
    
    categoryWithApiCount : function(fromTime, toTime){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
        
        var pipeline = [];
        
        //add filters
        if(fromTime || toTime){
            var query = {};
            query.timestamp = {};
            if(fromTime){
                query.timestamp.$gt = Number(fromTime);
            }
            
            if(toTime){
                query.timestamp.$lt = Number(toTime);
            }
            
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
	}
       
};