<<<<<<< HEAD
module.exports = function(){

	require('./config/dbConnection.js')();
	var express = require('express');
	var bodyParser = require('body-parser');		

	global.app = express();

	global.app.use('/',express.static(__dirname + '/public'));
	global.app.use(bodyParser.urlencoded({extended:true}));
	global.app.use(bodyParser.json());
	require('./config/cors.js')(); //cors!
=======
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
		mongoClient.connect(global.keys.mongodb,function (err, db) {
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
	    })
	}
>>>>>>> cc53f4d22d0fcfe4370b01a6e148e63c087183c8

	//Routes
	function attachAPI(){
	    try{
	       require('./api/analytics')();
<<<<<<< HEAD
	       require('./api/statistics')();
=======
	       require('./api/userAnalytics')();
	       require('./api/server')();
	       require('./api/payments')();	              
>>>>>>> cc53f4d22d0fcfe4370b01a6e148e63c087183c8
	    }catch(e){
	       console.log(e);
	    }
	}

	//Services
	function attachServices(){
		try{
<<<<<<< HEAD
	       global.analyticsService = require('./service/analytics.js');
=======
	       global.analyticsService = require('./service/analyticsService.js');	      
	       global.userApiAnalyticsService = require('./service/userApiAnalyticsService.js');
	       global.userMonthlyApiService = require('./service/userMonthlyApiService.js');
	       global.userStorageAnalyticsService = require('./service/userStorageAnalyticsService.js');

	       global.serverService = require('./service/serverService.js');
	       global.paymentsService = require('./service/paymentsService.js');
	       global.twoCheckoutService = require('./service/twoCheckoutService.js');
	       global.salesService = require('./service/salesService.js');
	       global.appPlansService = require('./service/appPlansService.js');
>>>>>>> cc53f4d22d0fcfe4370b01a6e148e63c087183c8
	    }catch(e){
	       console.log(e);
	    }	    
	}

<<<<<<< HEAD
    attachServices();
    attachAPI();	 

 	return app;
};


=======
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
>>>>>>> cc53f4d22d0fcfe4370b01a6e148e63c087183c8
