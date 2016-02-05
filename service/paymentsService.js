module.exports ={

   
    createSale : function(appId,data){
        
        var _self = this;

        var deferred= q.defer();     
         
        global.twoCheckoutService.createSale(data).then(function(doc){                    
            deferred.resolve(doc);
        },function(error){
            deferred.reject(error);
        });

        return deferred.promise; 
    },


};

