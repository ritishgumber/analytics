module.exports = function() {


    //Create Sale
    global.app.post('/:appId/sale',function(req,res){

    	  var data = req.body || {};
        var appId=req.params.appId;        

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){
            
          global.paymentsService.createSale(appId,data).then(function(respData) {
            if (!respData) {               
              return res.status(400).send('Error : Something went wrong');
            }               
            return res.status(200).json(respData);

          },function(error){              
            return res.status(400).send(error);
          });

        }else{         
          return res.status(400).send("Unauthorized. Server is not recognized.");
        }

    });


    //Cancel(stop recurring)
    global.app.post('/:appId/cancel',function(req,res){

        var data = req.body || {};
        var appId=req.params.appId;       

        if(data.secureKey && global.keys.hostedSecureKey==data.secureKey){          
            
          global.paymentsService.stopRecurring(data.secureKey,appId,data.userId).then(function(respData) {
            if (!respData) {               
              return res.status(400).send('Error : No Document Found!');
            }               
            return res.status(200).json(respData);

          },function(error){              
            return res.status(400).send(error);
          });

        }else{         
          return res.status(400).send("Unauthorized. Server is not recognized.");
        }

    });
    
};
