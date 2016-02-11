
module.exports = {
    

    addRecord : function(host,appId){
        
        var _self = this;

        var deferred= q.defer();


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
    
        return deferred.promise;
    },
  
    insertOne : function(saveJson){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userMonthlyApiNamespace);      
            
        collection.insertOne(saveJson,function(err,doc){
            if(err) {               
                deferred.reject(err);
            }else{                    
                deferred.resolve(doc);                              
            }
        });
       
        return deferred.promise;
    },
    findByMonth : function(host,appId,dateObj){
        
        
        var deferred= q.defer();
        
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
        
        return deferred.promise;
    },
    updateByMonth : function(host,appId,dateObj,newJson){
        
        var deferred= q.defer();
        
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
        
        return deferred.promise;
    },
    monthlyApiByAppId : function(host,appId,fromTime){
        
        var deferred= q.defer();
        
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
                deferred.resolve(doc);                
            }else{
                deferred.resolve(null);
            }
        });
        
        return deferred.promise;
    }

};    
