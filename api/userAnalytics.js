module.exports = function() {

    //Save monthly Storage details(from data services DB SERVER)
    global.app.post('/save/storage',function(req,res){

        var data = req.body || {}; 
        var appId=req.params.appId;        
       
        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
            global.userStorageAnalyticsService.addRecords(data.secureKey,data.dbArray).then(function(result){
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{            
            return res.status(400).send("Unauthorized");
        }

    });


    //get monthly User Analytics
    global.app.post('/:appId/api/usage',function(req,res){

        var data = req.body || {};
        var appId=req.params.appId;        

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
	        global.userApiAnalyticsService.monthlyAnalyticsByAppId(data.secureKey,appId,null).then(function(result){                
	           return res.status(200).json(result);
	        }, function(error){           
	            return res.status(400).send(error);
	        });
    	}else{
           return res.status(400).send("Unauthorized");
        }

    });

    //get monthly Storage
    global.app.post('/:appId/storage/usage',function(req,res){

        var data = req.body || {}; 
        var appId=req.params.appId;        

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
            global.userStorageAnalyticsService.monthlyAnalyticsByAppId(data.secureKey,appId,null).then(function(result){
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.status(400).send("Unauthorized");
        }

    });


    //get monthly User Analytics
    global.app.post('/:appId/api/count',function(req,res){

        var data = req.body || {};
        var appId=req.params.appId;        

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
            global.userMonthlyApiService.monthlyApiByAppId(data.secureKey,appId,null).then(function(result){                
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.status(400).send("Unauthorized");
        }

    });

    //get LastDay Storage
    global.app.post('/:appId/storage/count',function(req,res){

        var data = req.body || {}; 
        var appId=req.params.appId;        

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
            global.userStorageAnalyticsService.lastRecordByAppId(data.secureKey,appId).then(function(result){
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.status(400).send("Unauthorized");
        }

    });
    
};
