var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var CronJob = require('cron').CronJob;

module.exports = function(){	

	global.app = express();
	global.app.use('/',express.static(__dirname + '/public'));
	global.app.use(bodyParser.urlencoded({extended:true}));
	global.app.use(bodyParser.json());
	require('./config/cors.js')(); //cors

	

	function connectMongoDB(){
	   //MongoDB connections. 

	   if(!global.config && !process.env["ANALYTICS_MONGO_SERVICE_HOST"]){
	      console.error("FATAL : MongoDB Cluster Not found. Use docker-compose from https://github.com/cloudboost/docker or Kubernetes from https://github.com/cloudboost/kubernetes");
	   }

	   var mongoConnectionString = "mongodb://";
	   
	   var isReplicaSet = false;
	   
	   if(global.config && global.config.mongo && global.config.mongo.length>0){
	       //take from config file
	       
	       if(global.config.mongo.length>1){
	           isReplicaSet = true;
	       }
	       
	       for(var i=0;i<global.config.mongo.length;i++){
	            mongoConnectionString+=global.config.mongo[i].host +":"+global.config.mongo[i].port;
	            mongoConnectionString+=",";
	       }

	   }else{
	        
	        if(!global.config){
	            global.config = {};
	        }

	        global.config.mongo = []; 
	        
	       if(process.env["ANALYTICS_MONGO_SERVICE_HOST"]){
	            console.log("MongoDB is running on Kubernetes");
	           
	            global.config.mongo.push({
	                host :  process.env["ANALYTICS_MONGO_SERVICE_HOST"],
	                port : process.env["ANALYTICS_MONGO_SERVICE_PORT"]
	            });

	            mongoConnectionString+=process.env["MONGO_SERVICE_HOST"]+":"+process.env["MONGO_SERVICE_PORT"]; 
	            mongoConnectionString+=",";
	            
	            isReplicaSet = true;
	            
	       }else{
	            var i=1;
	            
	            while(process.env["MONGO_"+i+"_PORT_27017_TCP_ADDR"] && process.env["MONGO_"+i+"_PORT_27017_TCP_PORT"]){
	                if(i>1){
	                  isReplicaSet = true;
	                }

	                global.config.mongo.push({
	                    host :  process.env["MONGO_"+i+"_PORT_27017_TCP_ADDR"],
	                    port : process.env["MONGO_"+i+"_PORT_27017_TCP_PORT"]
	                });

	                mongoConnectionString+=process.env["MONGO_"+i+"_PORT_27017_TCP_ADDR"]+":"+process.env["MONGO_"+i+"_PORT_27017_TCP_PORT"]; 
	                mongoConnectionString+=",";
	                i++;
	            }
	       }
	   }
	  
	   mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
	   mongoConnectionString += "/"; //de limitter. 
	   global.keys.mongoConnectionString = mongoConnectionString;

	   if(isReplicaSet){
	       console.log("MongoDB is in ReplicaSet");
	       var str = "?replicaSet=cloudboostanalytics&slaveOk=true";
	       global.keys.mongoConnectionString+=str;
	   }

	   console.log("MongoDB connection string : ");
	   console.log(global.keys.mongoConnectionString);
	   
	   mongoClient.connect(global.keys.mongoConnectionString,function (err, db) {
	        if (err) {
	            console.log("Error connecting to MongoDB");
	            console.log(err);
	        } else {            
	            console.log("Database connected successfully");
	            global.mongoClient = db;

	            //allowing services to run after connecting to mongoDB
	            attachServices();
   				attachAPI();
   				_runDefaultFunctions();
    			_runUserAnalyticsCronJob();	
	        }
	    });
	   
	}

	//Routes
	function attachAPI(){
	    try{
	       require('./api/analytics')();
	       require('./api/userAnalytics')();
	       require('./api/server')();
	       require('./api/payments')();	              
	    }catch(e){
	       console.log(e);
	    }
	}

	//Services
	function attachServices(){
		try{
	       global.analyticsService = require('./service/analyticsService.js');	      
	       global.userApiAnalyticsService = require('./service/userApiAnalyticsService.js');
	       global.userMonthlyApiService = require('./service/userMonthlyApiService.js');
	       global.userStorageAnalyticsService = require('./service/userStorageAnalyticsService.js');

	       global.serverService = require('./service/serverService.js');
	       global.paymentsService = require('./service/paymentsService.js');
	       global.twoCheckoutService = require('./service/twoCheckoutService.js');
	       global.salesService = require('./service/salesService.js');
	       global.appPlansService = require('./service/appPlansService.js');
	    }catch(e){
	       console.log(e);
	    }	    
	}

	connectMongoDB();    
    
 	return app;
};

function _runDefaultFunctions(){
	global.clusterKeysList={};	

	global.serverService.getList().then(function(list){

		if(list){

			for(var i=0;i<list.length;++i){			
				global.clusterKeysList[list[i].secureKey]=1;			
			}
		}				        

    }, function(error){           
        console.log("Error in getting cluster keys");
    });
}

function _runUserAnalyticsCronJob(){		

	try {
		
		var UserStorageAnalyticsJob = new CronJob('58 58 23 * * *', function() {
		  /*
		   * Runs every day
		   * at 11:58:58 PM(58 58 23 * * *)		   
		   */
		    
		    global.mongoClient.command({listDatabases: 1},function(err, databaseStatList){
				if(err) {            
		            console.log(err);            
		        }else if(databaseStatList){
		            
		            for(var i=0;i<databaseStatList.databases.length;++i){		            	
		            	global.userStorageAnalyticsService.addRecord(global.keys.hostedSecureKey,databaseStatList.databases[i].name,databaseStatList.databases[i].sizeOnDisk);
		            }                         
		        }
			});

		  }, function () {
		    /* This function is executed when the job stops */
		  },
		  true, /* Start the job right now */
		  null /* Time zone of this job. */
		);

	} catch(ex) {
		console.log("User Storage Analytics cron pattern not valid");
	}
}
