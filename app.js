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
    			_runUserAnalyticsCronJob();	
	        }
	    })
	}

	//Routes
	function attachAPI(){
	    try{
	       require('./api/analytics')();
	       require('./api/userApiAnalytics')();	
	       require('./api/userStorageAnalytics')();	        
	    }catch(e){
	       console.log(e);
	    }
	}

	//Services
	function attachServices(){
		try{
	       global.analyticsService = require('./service/analyticsService.js');	       
	       global.twoCheckoutService = require('./service/twoCheckoutService.js');
	       global.userApiAnalyticsService = require('./service/userApiAnalyticsService.js');
	       global.userStorageAnalyticsService = require('./service/userStorageAnalyticsService.js');
	    }catch(e){
	       console.log(e);
	    }	    
	}

	connectMongoDB();    
    
 	return app;
};


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
		            	console.log(databaseStatList.databases[i]);
		            	global.userStorageAnalyticsService.addRecord(databaseStatList.databases[i].name,databaseStatList.databases[i].sizeOnDisk);
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