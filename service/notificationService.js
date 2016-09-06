
module.exports = {

    insertOne : function(host,appId,notifyType){
        
        var deferred= q.defer();        

        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.notificationNamespace); 

            var saveJson={
            	host:host,
            	appId:appId,        	
            	notifyType:notifyType,
            	timeStamp: new Date().getTime(),
            };     
                
            collection.insertOne(saveJson,function(err,doc){
                if(err) {               
                    deferred.reject(err);
                }else{                    
                    deferred.resolve(doc.ops[0]);                              
                }
            });

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }
       
        return deferred.promise;
    },
    findByMonth : function(host,appId,notifyType,dateObj){
        
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.notificationNamespace);          

            var startDay=dateObj;
            startDay.setDate(1); 
            startDay.setHours(0,0,0,0); 
            startDay=startDay.getTime();          
            
            var endDay=dateObj;
            endDay=new Date(endDay.getFullYear(), endDay.getMonth() + 1, 0, 23, 59, 59); 
            endDay=endDay.getTime();     


            collection.findOne({host:host,appId:appId,notifyType:notifyType,timeStamp: {"$gte": startDay, "$lt": endDay}      
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
    }
};    

