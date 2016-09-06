module.exports ={

   
    saveSale : function(saleDocument){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.salesNamespace);      
                
            collection.save(saleDocument,function(err,doc){
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

    getLatestSale : function(appId,userId){
        
        var deferred= q.defer();
        
        try{
            
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.salesNamespace);         

            collection.find({appId:appId,userId:userId}).sort({saleTimestamp:-1}).toArray(function(err,docs){
                if(err) {                
                    deferred.reject(err);
                }else{                
                    deferred.resolve(docs[0]);
                }
            });

        } catch(err){           
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            deferred.reject(err);
        }
       
        return deferred.promise; 
    },


};

