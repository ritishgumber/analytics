module.exports ={

   
    registerCluster : function(secureKey){
        
        var _self = this;

        var deferred= q.defer();     
        
        try{
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
                
                //Add to global clusterkeyObject
                global.clusterKeysList[secureKey]=1;      

            },function(error){
                deferred.reject(error);
            });

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }

        return deferred.promise;
    },
    insertKey : function(newDoc){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.clustersNamespace);      
                
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
    findKey : function(secureKey){        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.clustersNamespace); 

            collection.findOne({secureKey:secureKey},function(err,doc){
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
    getList : function(){        
        
        var deferred= q.defer();
        
        try{
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
        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }
        
        return deferred.promise;
    },

    getDBStatuses : function(){        
        
        var deferred= q.defer();
        
        try{

            var promises=[];      

            promises.push(_mongoDbStatus());           

            q.all(promises).then(function(resultList){
                if(resultList && resultList[0]){
                  deferred.resolve("All are running..");                
                }else{
                  deferred.reject("Something went wrong..");
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

};


function _mongoDbStatus(){

    console.log("MongoDB Status Function...");

    var deferred = q.defer();

    try{

        global.mongoClient.command({ serverStatus: 1},function(err, status){
          if(err) { 
            console.log(err);
            deferred.reject(err);                                    
          }

          console.log("MongoDB Status:"+status.ok);
          if(status && status.ok===1){         
            deferred.resolve("Ok");                                              
          }else{        
            deferred.reject("Failed");
          }
        });

    }catch(err){
      global.winston.log('error',{"error":String(err),"stack": new Error().stack});
      deferred.reject(err);
    }

    return deferred.promise;
}


