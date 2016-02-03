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
	       require('./api/userAnalytics')();	       
	    }catch(e){
	       console.log(e);
	    }
	}

	//Services
	function attachServices(){
		try{
	       global.analyticsService = require('./service/analyticsService.js');	       
	       global.twoCheckoutService = require('./service/twoCheckoutService.js');
	       global.userAnalyticsService = require('./service/userAnalyticsService.js');
	    }catch(e){
	       console.log(e);
	    }	    
	}

	connectMongoDB();    
    
 	return app;
};


function _runUserAnalyticsCronJob(){


	try {
		
		var job = new CronJob('* * * * * *', function() {
		  /*
		   * Runs every weekday (Monday through Friday)
		   * at 11:30:00 AM. It does not run on Saturday
		   * or Sunday.
		   */
		    

		  }, function () {
		    /* This function is executed when the job stops */
		  },
		  true, /* Start the job right now */
		  null /* Time zone of this job. */
		);

	} catch(ex) {
		console.log("User Analytics cron pattern not valid");
	}
}