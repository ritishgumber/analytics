module.exports ={

   
    addRecords : function(host,dbArray){
        
        var _self = this;

        var deferred= q.defer();        
     
        if(dbArray && dbArray.length>0){

            var promises=[];
            for(var i=0;i<dbArray.length;++i){

                var size=(dbArray[i].sizeOnDisk/1048576);//Convert Bytes to MBs
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
    monthlyAnalyticsByAppId : function(host,appId,fromTime){
        
        var deferred= q.defer();
        
        var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.userStorageAnalyticsNamespace);
        
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
