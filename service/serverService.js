module.exports ={

   
    registerCluster : function(secureKey){
        
        var _self = this;

        var deferred= q.defer();     
        
        _self.findKey(secureKey).then(function(doc){         
        	if(!doc){

                var newDoc={
                    secureKey:secureKey
                };
                _self.insertKey(newDoc).then(function(savedDoc){
                    deferred.resolve({"status":"Okay"});
                },function(error){
                    deferred.reject(error);
                });

            }else{
                deferred.resolve({"status":"Okay"});
            }      

        },function(error){
            deferred.reject(error);
        });

        return deferred.promise;
    },
    insertKey : function(newDoc){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.clustersNamespace);      
            
        collection.insertOne(newDoc,function(err,doc){
            if(err) {               
                deferred.reject(err);
            }else{                    
                deferred.resolve(doc);                              
            }
        });
       
        return deferred.promise;
    },
    findKey : function(secureKey){        
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.clustersNamespace); 

        collection.findOne({secureKey:secureKey},function(err,doc){
            if(err) {                
                deferred.reject(err);
            }else{                
                deferred.resolve(doc);
            }
        });
        
        return deferred.promise;
    },
    getList : function(){        
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.clustersNamespace); 

        collection.find({}).toArray(function(err,docList){
            if(err) {                
                deferred.reject(err);
            }else if(docList && docList.length>0){                
                deferred.resolve(docList);
            }else{
                deferred.resolve(null);
            }
        });
        
        return deferred.promise;
    },

};

