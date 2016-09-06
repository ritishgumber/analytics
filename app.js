var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var CronJob = require('cron').CronJob;
global.winston = require('winston');
require('winston-loggly');
var expressWinston = require('express-winston');

module.exports = function(){	

	global.app = express();
	global.app.use('/',express.static(__dirname + '/public'));
	global.app.use(bodyParser.urlencoded({extended:true}));
	global.app.use(bodyParser.json());
	require('./config/cors.js')(); //cors

	global.winston.add(global.winston.transports.Loggly, {
	    token: global.keys.logToken,
	    subdomain: "cloudboost",
	    tags: ["analytics-server"],
	    json:true
	});	

	function connectMongoDB(){
	   //MongoDB connections. 

	   try{
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

		            mongoConnectionString+=process.env["ANALYTICS_MONGO_SERVICE_HOST"]+":"+process.env["ANALYTICS_MONGO_SERVICE_PORT"]; 
		            mongoConnectionString+=",";

		            var i=2;
	              	while(process.env["ANALYTICS_MONGO"+i+"_SERVICE_HOST"]){
		                global.config.mongo.push({
		                    host :  process.env["ANALYTICS_MONGO"+i+"_SERVICE_HOST"],
		                    port : process.env["ANALYTICS_MONGO"+i+"_SERVICE_PORT"]
		                });
		                mongoConnectionString+=process.env["ANALYTICS_MONGO"+i+"_SERVICE_HOST"]+":"+process.env["ANALYTICS_MONGO"+i+"_SERVICE_PORT"]; 
		                mongoConnectionString+=",";
		                ++i;
	              	}
		            
		            isReplicaSet = true;    
		       }
		   }
		  
		   mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
		   mongoConnectionString += "/"; //de limitter. 
		   global.keys.mongoConnectionString = mongoConnectionString;

		   if(isReplicaSet){
		       console.log("MongoDB is in ReplicaSet");
		       var str = "?replicaSet=cloudboostanalytics&slaveOk=true&maxPoolSize=200&ssl=false&connectTimeoutMS=30000&socketTimeoutMS=30000&w=1&wtimeoutMS=30000";
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
		        }
		    });

		}catch(e){
			global.winston.log('error',{"error":String(e),"stack": new Error().stack}) ;
		}

	}

	//Routes
	function attachAPI(){
	    try{
	       require('./api/analytics')();
	       require('./api/userAnalytics')();
	       require('./api/server')();
	       require('./api/payments')();
	       require('./api/appPlans')();	              
	    }catch(e){
	       console.log(e);
	       global.winston.log('error',{"error":String(e),"stack": new Error().stack}) ;
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
	       global.notificationService = require('./service/notificationService.js');
	    }catch(e){
	       console.log(e);
	       global.winston.log('error',{"error":String(e),"stack": new Error().stack}) ;
	    }	    
	}

	connectMongoDB();
    
 	return app;
};
