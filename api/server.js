module.exports = function() {


    //Register new server
    global.app.post('/server/register',function(req,res){

    	var data = req.body || {};                 

        if(data.secureKey){
            global.serverService.registerCluster(data.secureKey).then(function(result){
               return res.status(200).json(result);
            }, function(error){           
                return res.status(400).send(error);
            });
        }else{
            return res.send(400, "Unauthorized");
        }

    });


   //know server isHosted?
    global.app.get('/server/isHosted',function(req,res){

       

    });

    
};
