module.exports = function() {


    //Register new server
    global.app.post('/server/register',function(req,res){

        try{
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
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        }

    });


   //know server isHosted?
    global.app.post('/server/isHosted',function(req,res){

        try{
            var data = req.body || {}; 

            if(data.secureKey){

                if(data.secureKey==global.keys.hostedSecureKey){
                    return res.status(200).send(true);
                }else{
                    return res.status(200).send(false);
                }

            }else{
                return res.send(400, "Bad Request");
            } 
        }catch(err){
            global.winston.log('error',{"error":String(err),"stack": new Error().stack}) ;
            res.status(500).send("Error");
        }       

    });

    global.app.get('/status', function(req,res,next) {

        console.log("MongoDb Status..");

        global.serverService.getDBStatuses().then(function(response){           
            return res.status(200).json({status:200, message : "Service Status : OK"});            
        },function(error){
            return res.status(500).send("Something went wrong!");
        });
                  
    });

    
};

