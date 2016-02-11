module.exports ={

   
    createAppPlan : function(host,appId,planId){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);      
            
        _self.findApp(appId).then(function(doc){         
            if(!doc){

                var newDoc={
                    host:host,
                    
                };
                _self.insertKey(newDoc).then(function(savedDoc){
                    deferred.resolve({"status":"Okay"});
                },function(error){
                    deferred.reject(error);
                });

            }else{
                deferred.resolve({"status":"Okay"});
            }
            
            //Add to global clusterkeyObject
            global.clusterKeysList[secureKey]=1;      

        },function(error){
            deferred.reject(error);
        });
       
        return deferred.promise; 
    },  
    insertKey : function(newDoc){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace);      
            
        collection.insertOne(newDoc,function(err,doc){
            if(err) {               
                deferred.reject(err);
            }else{                    
                deferred.resolve(doc);                              
            }
        });
       
        return deferred.promise;
    },
    findApp : function(host,appId){        
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.appPlansNamespace); 

        collection.findOne({host:host,appId:appId},function(err,doc){
            if(err) {                
                deferred.reject(err);
            }else{                
                deferred.resolve(doc);
            }
        });
        
        return deferred.promise;
    },
};

