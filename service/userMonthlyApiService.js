var _ = require('underscore');

module.exports = {
    

    addRecord : function(host,appId){
        
        var _self = this;

        var deferred= q.defer();

        try{

            _self.findByMonth(host,appId,new Date()).then(function(doc){         
                if(doc){
                    var newMonthlyApiCount=doc.monthlyApiCount;
                    ++newMonthlyApiCount;

                    var updateJson={                    
                        monthlyApiCount: newMonthlyApiCount                   
                    };
                    return _self.updateByMonth(host,appId,new Date(),updateJson);
                }else{
                    var docJson={
                        host:host,
                        appId:appId,
                        monthlyApiCount:1,
                        timeStamp: new Date().getTime()
                    };
                   return _self.insertOne(docJson);
                }
              
            }).then(function(savedDoc){
                deferred.resolve(savedDoc);
            },function(error){
                deferred.reject(error);
            }); 

        } catch(err){           
          global.winston.log('error',err);
          deferred.reject(err);
        }      
    
        return deferred.promise;
    },
  
    insertOne : function(saveJson){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);      
                
            collection.insertOne(saveJson,function(err,doc){
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
    findByMonth : function(host,appId,dateObj){
        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);          

            var startDay=dateObj;
            startDay.setDate(1); 
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay=new Date(endDay.getFullYear(), endDay.getMonth() + 1, 0, 23, 59, 59); 
            endDay=endDay.getTime(); 

            collection.findOne({host:host,appId:appId, timeStamp: {$gte: startDay, $lt: endDay}      
            },function(err,doc){
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
    countAppsByCallByMonth : function(dateObj,noCalls){
        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);          

            if(!dateObj){
               dateObj=new Date(); 
            }

            var startDay=dateObj;
            startDay.setDate(1); 
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay=new Date(endDay.getFullYear(), endDay.getMonth() + 1, 0, 23, 59, 59); 
            endDay=endDay.getTime(); 


            noCalls=parseInt(noCalls);

            collection.count({monthlyApiCount:{$gte:noCalls}, timeStamp: {$gte: startDay, $lt: endDay}      
            },function(err,count){
                if(err) {                
                    deferred.reject(err);
                }else{                
                    deferred.resolve(count);
                }
            });

        } catch(err){           
          global.winston.log('error',err);
          deferred.reject(err);
        }
        
        return deferred.promise;
    },
    updateByMonth : function(host,appId,dateObj,newJson){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);

            var startDay=dateObj;
            startDay.setDate(1); 
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay=new Date(endDay.getFullYear(), endDay.getMonth() + 1, 0, 23, 59, 59); 
            endDay=endDay.getTime();  
                
            collection.findOneAndUpdate({host:host,appId:appId,timeStamp: {$gte: startDay, $lt: endDay}
            },{$set:newJson},{upsert: true,returnOriginal:false},function(err,doc){
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
    monthlyApiByAppId : function(host,appId,fromTime){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);
            
            if(!fromTime){  
                //Start from everymonth 1st    
                var fromTime = new Date();
                fromTime.setDate(0);
                fromTime.setHours(0,0,0,0);           
                fromTime=fromTime.getTime();
            }             
          
            collection.findOne({host:host,appId:appId,timeStamp: {$gte: fromTime}},function(err,doc){
                if(err) {                               
                    deferred.reject(err);
                }else if(doc){
                    if(doc.host){
                        delete doc.host;
                    }
                    deferred.resolve(doc);                
                }else{
                    var defaultResp={                    
                        appId:appId,
                        monthlyApiCount:0                    
                    };
                    deferred.resolve(defaultResp);
                }
            });

        } catch(err){           
          global.winston.log('error',err);
          deferred.reject(err);
        }
        
        return deferred.promise;
    },
    bulkMonthlyApi : function(host,appIdArray,fromTime){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);
            
            if(!fromTime){  
                //Start from everymonth 1st    
                var fromTime = new Date();
                fromTime.setDate(0);
                fromTime.setHours(0,0,0,0);           
                fromTime=fromTime.getTime();
            }             
          
            collection.find({host:host,appId:{ $in: appIdArray },timeStamp: {$gte: fromTime}}).toArray(function(err,docs){
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
                }else if(docs && docs.length){

                    var response=[];

                    //delete host
                    for(var i=0;i<docs.length;++i){
                        if(docs[i].host){
                            delete docs[i].host;
                        }
                        response.push(docs[i]);
                    }
                    

                    for(var i=0;i<appIdArray.length;++i){

                        var foundDoc=_.find(docs, function(eachDoc){
                            if(eachDoc.appId==appIdArray[i]){
                                return true;
                            }
                        });

                        if(!foundDoc){
                            var defaultResp={                    
                                appId:appIdArray[i],
                                monthlyApiCount:0                    
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
                                monthlyApiCount:0                    
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
          global.winston.log('error',err);
          deferred.reject(err);
        }
        
        return deferred.promise;
    }

};    
