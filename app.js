module.exports = function(){

	require('./config/dbConnection.js')();
	var express = require('express');
	var bodyParser = require('body-parser');		

	global.app = express();

	global.app.use('/',express.static(__dirname + '/public'));
	global.app.use(bodyParser.urlencoded({extended:true}));
	global.app.use(bodyParser.json());
	require('./config/cors.js')(); //cors!

	//Routes
	function attachAPI(){
	    try{
	       require('./api/analytics')();
	       require('./api/statistics')();
	    }catch(e){
	       console.log(e);
	    }
	}

	//Services
	function attachServices(){
		try{
	       global.analyticsService = require('./service/analytics.js');
	    }catch(e){
	       console.log(e);
	    }	    
	}

    attachServices();
    attachAPI();	 

 	return app;
};


