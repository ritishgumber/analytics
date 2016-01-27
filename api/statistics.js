module.exports = function() {

    //Get Statics And Pricing by Catgeory
    global.app.post('/statistics',function(req,res){
        
        var appId = req.body.appId;
        var fromTime = req.body.fromTime;
        var category = req.body.category;
        var subCategory = req.body.subCategory;

        if(appId){
            global.analyticsService.statisticsByAppId(appId,fromTime,category,subCategory).then(function(result){
                res.status(200).json(result);
            }, function(error){
                res.status(500).send(error);
            });            
        }else{
            res.status(400).send("Bad Request");
        }       
        
    });   
    
};
