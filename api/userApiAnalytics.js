module.exports = function() {

   //get monthly User Analytics
    global.app.post('/userapi',function(req,res){

        var data = req.body || {};        

        if(data.secureKey){
	        global.userApiAnalyticsService.monthlyAnalyticsByAppId(data.appId,null).then(function(result){
	           return res.status(200).json(result);
	        }, function(error){           
	            return res.status(400).send(error);
	        });
    	}else{
            return res.send(400, "Unauthorized");
        }

    });
    
};
