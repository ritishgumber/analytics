module.exports = function() {

    //Save monthly Storage details(from data services DB SERVER)
    global.app.post('/save/storage',function(req,res){

        try{
            var data = req.body || {}; 
            var appId=req.params.appId;        
           
            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
                    global.userStorageAnalyticsService.addRecords(data.secureKey,data.dbArray).then(function(result){
                        return res.status(200).json(result);
                    }, function(error){
                        console.log("Error in saving Storage");
                        console.log(error);           
                        return res.status(400).send(error);
                    });
                }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 
    });


    //get monthly User Analytics
    global.app.post('/:appId/api/usage',function(req,res){

        try{
            var data = req.body || {};
            var appId=req.params.appId;        

            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
        	        global.userApiAnalyticsService.monthlyAnalyticsByAppId(data.secureKey,appId,null).then(function(result){                
        	           return res.status(200).json(result);
        	        }, function(error){  
                        console.log("Error in getting api usage");
                        console.log(error);          
        	            return res.status(400).send(error);
        	        });
        	    }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 

    });

    //get monthly Storage
    global.app.post('/:appId/storage/usage',function(req,res){

        try{
            var data = req.body || {}; 
            var appId=req.params.appId;        

            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
                    global.userStorageAnalyticsService.monthlyAnalyticsByAppId(data.secureKey,appId,null).then(function(result){
                       return res.status(200).json(result);
                    }, function(error){  
                        console.log("Error in getting storage usage");
                        console.log(error);         
                        return res.status(400).send(error);
                    });
                }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 

    });


    //get monthly User Analytics
    global.app.post('/:appId/api/count',function(req,res){

        try{
            var data = req.body || {};
            var appId=req.params.appId;        

            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
                    global.userMonthlyApiService.monthlyApiByAppId(data.secureKey,appId,null).then(function(result){                
                       return res.status(200).json(result);
                    }, function(error){ 
                        console.log("Error in getting api count");
                        console.log(error);          
                        return res.status(400).send(error);
                    });
                }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 

    });

    //get LastDay Storage
    global.app.post('/:appId/storage/count',function(req,res){

        try{
            var data = req.body || {}; 
            var appId=req.params.appId;        

            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
                    global.userStorageAnalyticsService.lastRecordByAppId(data.secureKey,appId).then(function(result){
                       return res.status(200).json(result);
                    }, function(error){   
                        console.log("Error in getting storage count");
                        console.log(error);        
                        return res.status(400).send(error);
                    });
                }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 

    });


    //get monthly User Analytics by Array of APPIDs
    global.app.post('/bulk/api-storage/count',function(req,res){

        try{
            var data = req.body || {};              

            global.serverService.findKey(data.secureKey).then(function(keyObj){

                if(keyObj){
                    var promises=[];

                    promises.push(global.userMonthlyApiService.bulkMonthlyApi(data.secureKey,data.appIdArray,null));
                    promises.push(global.userStorageAnalyticsService.bulkLastDayRecords(data.secureKey,data.appIdArray));


                    q.all(promises).then(function(list){  
                        var respObj={
                            api:list[0],
                            storage:list[1]
                        };              
                       return res.status(200).json(respObj);
                    }, function(error){ 
                        console.log("Error in getting bulk(appIds array) api-storage count");                         
                        return res.status(400).send(error);
                    });

                }else{ 
                    console.log("Not a valid secureKey");                       
                    return res.status(400).send("Unauthorized-Not a valid secureKey");
                }

            },function(error){
                res.status(401).send("Unauthorized");
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        } 

    });


    //get apps which crossed api calls(specified) by month
    global.app.post('/api/calls/:calls',function(req,res){

        try{
            var data = req.body || {};

            var noCalls=req.params.calls; 
            var host=data.host;
            var sdk=data.sdk;
            
            global.userMonthlyApiService.countAppsByCallByMonth(host,sdk,null,noCalls).then(function(result){                
               return res.status(200).json(result);
            }, function(error){  
                console.log("get apps which crossed api calls(specified) by month");
                console.log(error);          
                return res.status(400).send(error);
            });
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        }       

    });
    
};
