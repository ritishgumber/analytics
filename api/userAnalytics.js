module.exports = function() {

   //get monthly User Analytics
    global.app.post('/:appId/api',function(req,res){

        var data = req.body || {};
        var appId=req.params.appId;        

        if(data.secureKey){
	        global.userApiAnalyticsService.monthlyAnalyticsByAppId(appId,null).then(function(result){                
	           return res.status(200).json(result);
	        }, function(error){           
	            return res.status(400).send(error);
	        });
    	}else{
            return res.send(400, "Unauthorized");
        }

    });

    //get monthly Storage
    global.app.post('/:appId/storage',function(req,res){

        var data = req.body || {}; 
        var appId=req.params.appId;        

        if(data.secureKey){
            global.userStorageAnalyticsService.monthlyAnalyticsByAppId(appId,null).then(function(result){
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.send(400, "Unauthorized");
        }

    });
    
};
