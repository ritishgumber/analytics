module.exports = function() {


    //Register new server
    global.app.post('/:appId/sale',function(req,res){

    	var data = req.body || {};
        var appId=req.params.appId;      

        global.clusterKeysList[data.secureKey]=1;

        if(data.secureKey && global.clusterKeysList[data.secureKey]==1){
            
            global.paymentsService.createSale(appId,data).then(function(respData) {
              if (!respData) {               
                return res.status(400).send('Error : Went wrong not found');
              }               
              return res.status(200).json(respData);

            },function(error){              
              return res.status(400).send(error);
            });

        }else{         
            return res.status(400).send("Unauthorized");
        }

    });
    
};
