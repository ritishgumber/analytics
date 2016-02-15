module.exports = function() {


    //Create AppPlan
    global.app.post('/plan/:appId',function(req,res){

    	var data = req.body || {};
        var appId=req.params.appId;                  
       
        if(data.secureKey && global.clusterKeysList[data.secureKey]==1){
           
            global.appPlansService.upsertAppPlan(data.secureKey,appId,data.planId).then(function(result){
                return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.send(400, "Unauthorized");
        }

    });
    
};
