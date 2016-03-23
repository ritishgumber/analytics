module.exports = function() {


    //Create AppPlan
    global.app.post('/plan/:appId',function(req,res){

        try{ 
        	var data = req.body || {};
            var appId=req.params.appId;                  
           
            if(data && data.secureKey){
                global.serverService.findKey(data.secureKey).then(function(keyObj){
                    if(keyObj){               
                        global.appPlansService.upsertAppPlan(data.secureKey,appId,data.planId).then(function(result){
                            return res.status(200).json(result);
                        }, function(error){           
                            return res.status(400).send(error);
                        });
                    }else{
                        return res.send(400, "Unauthorized");
                    }
                },function(error){
                    return res.send(400, "Unauthorized");
                });
            }else{
                return res.send(400, "Unauthorized");
            }  
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack});
            res.status(500).send("Error");
        }       

    });
    
};
