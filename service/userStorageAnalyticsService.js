var _ = require('underscore');

module.exports ={

   
    addRecords : function(host,dbArray){
        
        var _self = this;

        var deferred= q.defer();        
     
        try{
            if(dbArray && dbArray.length>0){

                var promises=[];
                for(var i=0;i<dbArray.length;++i){

                    var size=(dbArray[i].sizeOnDisk/1048576);//Convert Bytes to MBs
                    
                    if((size>70 || size==70) && (size<80 || size==80)){
                        size=size-70;
                    }

                    var docJson={
                        host:host,            
                        appId:dbArray[i].name,
                        size:size,
                        timeStamp: new Date().getTime()
                    };

                    promises.push(_self.insertOne(docJson));
                }

                q.all(promises).then(function(list){ 
                    deferred.resolve(list);
                }, function(err){    
                    deferred.resolve(err);
                });            

            }else{
                deferred.resolve({message:"Empty DB Array"});
            } 

        } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
        }      

        return deferred.promise;
    },
    insertOne : function(saveJson){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);      
                
            collection.insertOne(saveJson,function(err,doc){
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
    monthlyAnalyticsByAppId : function(host,appId,fromTime){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);
            
            if(!fromTime){  
                //Start from everymonth 1st    
                var fromTime = new Date();
                fromTime.setDate(0);
                fromTime.setHours(0,0,0,0);           
                fromTime=fromTime.getTime();
            }             
          
            collection.find({host:host,appId:appId,timeStamp: {"$gte": fromTime}}).toArray(function(err,docs){
                if(err) {                               
                    deferred.reject(err);
                } else if(docs && docs.length>0) {
                    this.lastRecordByAppId(host,appId).then(function(data){
                        var responseData = _prepareResponse(docs)
                        responseData.totalStorage = data.size || 0
                        deferred.resolve(responseData);
                    },function(err){
                        deferred.resolve(null);
                    })             
                } else {
                    deferred.resolve(null);
                }
            }.bind(this));

        } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
        }
        
        return deferred.promise;
    },
    lastRecordByAppId : function(host,appId){
        
        var deferred= q.defer();
      
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);
            
            collection.findOne({host:host,appId:appId},{sort:{timeStamp: -1} }).then(function(doc){
                if(doc){
                    if(doc.host){
                        delete doc.host;
                    }
                    deferred.resolve(doc);                 
                }else{
                    var defaultResp={                              
                        appId:appId,
                        size:0                    
                    };
                    deferred.resolve(defaultResp);
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
    bulkLastDayRecords : function(host,appIdArray){
        
        var deferred= q.defer();
      
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);
            
            var pipeline = [];
             
            var query = {};
            query.host=host;
            query.appId={};
            query.appId.$in=appIdArray;
            pipeline.push({$match:query});          

            var group={$group:{"_id":"$appId", "timeStamp":{$max:"$timeStamp"}, size: { $last: "$size" } }};     
            pipeline.push(group);               

            collection.aggregate(pipeline, function(err,docs){
                if(err) {                
                    var response=[];
                    if(appIdArray && appIdArray.length>0){
                        for(var i=0;i<appIdArray.length;++i){
                            var defaultResp={                    
                                appId:appIdArray[i],
                                error:"Unable to get the data"                    
                            };
                            response.push(defaultResp);
                        }
                    }else{
                        var defaultResp={  
                            message:"Empty appId array",                    
                            error:"Unable to get the data"                    
                        };
                        response.push(defaultResp);
                    }                

                    deferred.reject(response);

                }else if(docs && docs.length>0){  

                    var response=[];                
                    
                    for(var i=0;i<docs.length;++i){

                        var defaultResp={                    
                            appId:docs[i]._id,
                            size:docs[i].size,
                            timeStamp:docs[i].timeStamp                    
                        };                       
                        response.push(defaultResp);
                    }

                    for(var i=0;i<appIdArray.length;++i){

                        var foundDoc=_.find(docs, function(eachDoc){
                            if(eachDoc._id==appIdArray[i]){
                                return true;
                            }
                        });

                        if(!foundDoc){
                            var defaultResp={                    
                                appId:appIdArray[i],
                                size:0                    
                            };
                            response.push(defaultResp);
                        }
                       
                    }
                    deferred.resolve(response);

                }else{

                    var response=[];
                    if(appIdArray && appIdArray.length>0){
                        for(var i=0;i<appIdArray.length;++i){
                            var defaultResp={                    
                                appId:appIdArray[i],
                                size:0                    
                            };
                            response.push(defaultResp);
                        }
                    }else{
                        var defaultResp={                      
                            message:"Empty appId array"                    
                        };
                        response.push(defaultResp);
                    }
                    
                    deferred.resolve(response);
                }
            });

        } catch(err){           
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
        }
        
        return deferred.promise;
    }

};


function _prepareResponse(dayCountList) {
    
    for(var i=0;i<dayCountList.length;++i){
        delete dayCountList[i].host;
    }  
   
    var response={                     
        usage: dayCountList       
    };

    return response;
}
