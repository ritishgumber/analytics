module.exports = function() {
   
    //get monthly Storage
    global.app.post('/userstorage',function(req,res){

        var data = req.body || {};        

        global.userStorageAnalyticsService.monthlyAnalyticsByAppId(data.appId,null).then(function(result){
           return res.status(200).json(result);
        }, function(error){           
            return res.status(400).send(error);
        });

    });
};
