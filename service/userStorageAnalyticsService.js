module.exports ={

   
    addRecord : function(appId,size){
        
        var _self = this;

        var deferred= q.defer();
     
     	size=(size/1048576);//Convert Bytes to MBs

     	var docJson={            
            appId:appId,
            size:size,
            timeStamp: new Date().getTime()
        };
        
        _self.insertOne(docJson).then(function(doc){         
        	deferred.resolve(doc);
        },function(error){
            deferred.reject(error);
        });

        return deferred.promise;
    },
    insertOne : function(saveJson){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);      
            
        collection.insertOne(saveJson,function(err,doc){
            if(err) {               
                deferred.reject(err);
            }else{                    
                deferred.resolve(doc);                              
            }
        });
       
        return deferred.promise;
    },
    monthlyAnalyticsByAppId : function(appId,fromTime){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);
        
        if(!fromTime){  
            //Start from everymonth 1st    
            var fromTime = new Date();
            fromTime.setDate(0);
            fromTime.setHours(0,0,0,0);           
            fromTime=fromTime.getTime();
        }             
      
        collection.find({appId:appId,timeStamp: {$gte: fromTime}}).toArray(function(err,docs){
            if(err) {                               
                deferred.reject(err);
            }else if(docs && docs.length>0){
                deferred.resolve(_prepareResponse(docs));                 
            }else{
                deferred.resolve(null);
            }
        });
        
        return deferred.promise;
    }

};


function _prepareResponse(dayCountList) {
    
    var totalStorage=0;
    for(var i=0;i<dayCountList.length;++i){
        totalStorage=totalStorage+parseInt(dayCountList[i].size)
    }  
   
    var response={                     
        totalStorage:totalStorage,
        usage: dayCountList       
    };

    return response;
}
