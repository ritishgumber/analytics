module.exports ={

   
    upsertAppPlan : function(host,appId,planId){
        
        var _self=this;

        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);      
                
            _self.findAppPlan(host,appId).then(function(doc){         
                if(!doc){

                    if(!planId){
                        planId=1;
                    }
                    var newDoc={
                        host:host,
                        appId:appId,
                        planId:planId
                    };
                    _self.insertAppPlan(newDoc).then(function(savedDoc){
                        deferred.resolve(savedDoc.ops[0]);
                    },function(error){
                        deferred.reject(error);
                    });

                }else{
                    deferred.resolve(doc);
                }                 

            },function(error){
                deferred.reject(error);
            });
        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
       
        return deferred.promise; 
    },  
    insertAppPlan : function(newDoc){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);      
                
            collection.insertOne(newDoc,function(err,doc){
                if(err) {               
                    deferred.reject(err);
                }else{                    
                    deferred.resolve(doc);                              
                }
            });
        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
       
        return deferred.promise;
    },
    findAppPlan : function(host,appId){        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace); 

            collection.findOne({host:host,appId:appId},function(err,doc){
                if(err) {                
                    deferred.reject(err);
                }else{                
                    deferred.resolve(doc);
                }
            });
        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    updatePlanId:function(host,appId,newPlanId){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);

            collection.findOneAndUpdate({host:host,appId:appId}, {$set: {planId:newPlanId}}, {returnOriginal: false, upsert: true}, function(err, doc) {
                if(err) {                
                    deferred.reject(err);
                }else{                
                    deferred.resolve(doc);
                } 
            });
        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }

        return deferred.promise;
    }
};

