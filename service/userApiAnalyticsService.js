
module.exports = {
    

    addRecord : function(host, appId){
        
        var _self = this;

        var deferred= q.defer();

        try{

            _self.findByDay(host,appId,new Date()).then(function(doc){         
                if(doc){
                    var newDayApiCount=doc.dayApiCount;
                    ++newDayApiCount;

                    var updateJson={                    
                        dayApiCount: newDayApiCount                   
                    };
                    return _self.updateByDay(host,appId,new Date(),updateJson);
                }else{
                    var docJson={
                        host:host,
                        appId:appId,
                        dayApiCount:1,
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
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
        }      
    
        return deferred.promise;
    },
  
    insertOne : function(saveJson){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userApiAnalyticsNamespace);      
                
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
    findByDay : function(host,appId,dateObj){
        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userApiAnalyticsNamespace);          

            var startDay=dateObj;
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay.setHours(23,59,59,0);
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
          global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
          deferred.reject(err);
        }
        
        return deferred.promise;
    },
    updateByDay : function(host,appId,dateObj,newJson){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userApiAnalyticsNamespace);

            var startDay=dateObj;
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay.setHours(23,59,59,0);
            endDay=endDay.getTime(); 
                
            collection.findOneAndUpdate({host:host,appId:appId,timeStamp: {$gte: startDay, $lt: endDay}
            },{$set:newJson},{upsert: true,returnOriginal:false},function(err,docList){
                if(err) {               
                    deferred.reject(err);
                }else{                         
                    deferred.resolve(docList);
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
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userApiAnalyticsNamespace);
            
            if(!fromTime){  
                //Start from everymonth 1st    
                var fromTime = new Date();
                fromTime.setDate(0);
                fromTime.setHours(0,0,0,0);           
                fromTime=fromTime.getTime();
            }             
          
            collection.find({host:host,appId:appId,timeStamp: {$gte: fromTime}}).toArray(function(err,docs){
                if(err) {                               
                    deferred.reject(err);
                }else if(docs && docs.length>0){
                    deferred.resolve(_prepareResponse(docs));                
                }else{                
                    deferred.resolve(null);
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

    var totalApiCount=0;
    for(var i=0;i<dayCountList.length;++i){
        totalApiCount=totalApiCount+parseInt(dayCountList[i].dayApiCount);
        delete dayCountList[i].host;
    }  
   
    var response={                     
        totalApiCount:totalApiCount,
        usage: dayCountList       
    };

    return response;
}
