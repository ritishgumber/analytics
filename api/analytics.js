module.exports = function() {

    //Save the API request to the database.
    global.app.post('/api/store',function(req,res){
        if(_validate(req,res)){
            
            var category = req.body.category;
            var subCategory = req.body.subCategory;
            var appId = req.body.appId;
            var host = req.body.host;
            var sdk = req.body.sdk;

            host=host.trim();      
            global.serverService.findKey(host).then(function(keyObj){

                if(keyObj){
                    global.analyticsService.store(host,appId, category, subCategory,sdk).then(function(resp){
                        res.status(200).json(resp);
                    },function(error){
                        res.status(400).send(error);
                    });
                }else{
                    res.status(401).send("Unauthorized");
                }                

            },function(error){
                res.status(401).send("Unauthorized");
            });                        
        }
    });
    
    //Total API Count
    global.app.post('/api/count',function(req,res){
        var category = req.body.category;
        var subCategory = req.body.subCategory;
        var appId = req.body.appId;
        var host = req.body.host;
        var fromTime = req.body.fromTime;
        var toTime = req.body.toTime;
        var sdk = req.body.sdk;
        global.analyticsService.totalApiCount(host, appId, category, subCategory, fromTime, toTime,sdk).then(function(result){
            res.status(200).json({count : result});
        }, function(error){
            res.status(500).send(error);
        });
    });
    
    //=FUNNEL IS BASICALLY APS THAT HAVE COMPLETED THE FUNNEL OF SIGN UP AND HAVE MORE THAN 500 API REQUESTS. 
    global.app.post('/app/funnel/count',function(req,res){
            var fromTime = req.body.fromTime;
            var toTime = req.body.toTime;
            var apiRequests = req.body.apiCount || 500;
            var sdk = req.body.sdk;
            global.analyticsService.funnelAppCount(fromTime, toTime,apiRequests,sdk).then(function(result){
                res.status(200).json({count : result});
            }, function(error){
                res.status(500).send(error);
            });
    });

    //Total Active API count
    global.app.post('/app/active/count',function(req,res){
            var fromTime = req.body.fromTime;
            var toTime = req.body.toTime;
            var sdk = req.body.sdk;
            global.analyticsService.activeAppCount(fromTime, toTime,sdk).then(function(result){
                res.status(200).json({count : result});
            }, function(error){
                res.status(500).send(error);
            });
    });
    
    
    //Get apps which are active.
    global.app.post('/app/active',function(req,res){
       
            var fromTime = req.body.fromTime;
            var toTime = req.body.toTime;
            var limit = req.body.limit;
            var skip = req.body.skip;
            var sdk = req.body.sdk;
            global.analyticsService.activeAppWithAPICount(fromTime, toTime, limit, skip,sdk).then(function(result){
                res.status(200).json(result);
            }, function(error){
                res.status(500).send(error);
            });
        
    });
    
    //Get apps which are active.
    global.app.post('/category/api',function(req,res){
       
            var fromTime = req.body.fromTime;
            var toTime = req.body.toTime; 
            var sdk = req.body.sdk;
            global.analyticsService.categoryWithApiCount(fromTime, toTime,sdk).then(function(result){
                res.status(200).json(result);
            }, function(error){
                res.status(500).send(error);
            });
        
    });
    

    function _validate(req,res){
        if(!req.body.category){
            res.status(400).send("Category is required.");
            return false;
        }
        if(!req.body.appId){
            res.status(400).send("AppID is required.");
            return false;
        }
        if(!req.body.host){
            res.status(400).send("Host is required.");
            return false;
        }       
        
        return true;
    }
};
