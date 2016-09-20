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
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
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
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
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
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }
        
        return deferred.promise;
    },

    updatePlanId:function(host,appId,newPlanId){
        
        console.log("Update plan ID");

        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);

            collection.findOneAndUpdate({host:host,appId:appId}, {$set: {planId:newPlanId}}, {returnOriginal: false, upsert: true}, function(err, doc) {
                if(err) {
                    console.log("Update plan Error.");                
                    deferred.reject(err);
                }else{
                    console.log("Update plan resolve.");                
                    deferred.resolve(doc);
                } 
            });
        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }

        return deferred.promise;
    },

    update: function(newAppPlanDoc){
        console.log("Update Plan Doc");

        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);

            collection.findOneAndUpdate({host:host,appId:appId}, {$set: newAppPlanDoc}, {returnOriginal: false, upsert: true}, function(err, doc) {
                if(err) {
                    console.log("Update plan Error.");                
                    deferred.reject(err);
                }else{
                    console.log("Update plan resolve.");                
                    deferred.resolve(doc);
                } 
            });
        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }

        return deferred.promise;
    }
};

