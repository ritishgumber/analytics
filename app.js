var express = require('express');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var CronJob = require('cron').CronJob;
global.winston = require('winston');
require('winston-loggly');
var expressWinston = require('express-winston');

module.exports = function () {

	global.app = express();
	global.app.use('/', express.static(__dirname + '/public'));
	global.app.use(bodyParser.urlencoded({ extended: true }));
	global.app.use(bodyParser.json());
	require('./config/cors.js')(); //cors

	global.winston.add(global.winston.transports.Loggly, {
		token: global.keys.logToken,
		subdomain: "cloudboost",
		tags: ["analytics-server"],
		json: true
	});

	function setUpMongoDB() {
		//MongoDB connections.

		try {

			console.log("Looking for a MongoDB Cluster...");

			if ((!global.config && !process.env["MONGO_1_PORT_27017_TCP_ADDR"] && !process.env["MONGO_SERVICE_HOST"]) || (!global.config && !process.env["MONGO_PORT_27017_TCP_ADDR"] && !process.env["MONGO_SERVICE_HOST"])) {
				console.error("INFO : Not running on Docker. Use docker-compose (recommended) from https://github.com/cloudboost/docker");
			}

			var mongoConnectionString = "mongodb://";

			if (process.env["CLOUDBOOST_MONGODB_USERNAME"] && process.env["CLOUDBOOST_MONGODB_PASSWORD"]) {
				mongoConnectionString += process.env["CLOUDBOOST_MONGODB_USERNAME"] + ":" + process.env["CLOUDBOOST_MONGODB_PASSWORD"] + "@";
			}

			var isReplicaSet = false;

			if (global.config && global.config.mongo && global.config.mongo.length > 0) {
				//take from config file

				console.log("Setting up MongoDB from config.....");
				if (global.config.mongo.length > 1) {
					isReplicaSet = true;
				}

				for (var i = 0; i < global.config.mongo.length; i++) {
					mongoConnectionString += global.config.mongo[i].host + ":" + global.config.mongo[i].port;
					mongoConnectionString += ",";
				}

			} else {

				if (!global.config) {
					global.config = {};
				}

				global.config.mongo = [];

				if (process.env["MONGO1_SERVICE_HOST"]) {
					console.log("MongoDB is running on Kubernetes");
					var i = 1;
					while (process.env["MONGO" + i + "_SERVICE_HOST"]) {
						global.config.mongo.push({
							host: process.env["MONGO" + i + "_SERVICE_HOST"],
							port: process.env["MONGO" + i + "_SERVICE_PORT"]
						});
						mongoConnectionString += process.env["MONGO" + i + "_SERVICE_HOST"] + ":" + process.env["MONGO" + i + "_SERVICE_PORT"];
						mongoConnectionString += ",";
						++i;
					}

					isReplicaSet = true;

				} else {


					var i = 1;

					if (process.env["MONGO_PORT_27017_TCP_ADDR"] && process.env["MONGO_PORT_27017_TCP_PORT"]) {
						global.config.mongo.push({
							host: process.env["MONGO_PORT_27017_TCP_ADDR"],
							port: process.env["MONGO_PORT_27017_TCP_PORT"]
						});

						mongoConnectionString += process.env["MONGO_PORT_27017_TCP_ADDR"] + ":" + process.env["MONGO_PORT_27017_TCP_PORT"];
						mongoConnectionString += ",";

					} else {

						while (process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"] && process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"]) {
							console.log("Setting up MongoDB from  process.env....");
							if (i > 1) {
								isReplicaSet = true;
							}

							global.config.mongo.push({
								host: process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"],
								port: process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"]
							});

							mongoConnectionString += process.env["MONGO_" + i + "_PORT_27017_TCP_ADDR"] + ":" + process.env["MONGO_" + i + "_PORT_27017_TCP_PORT"];
							mongoConnectionString += ",";
							i++;
						}
					}
				}
			}

			//if no docker/kubernetes or local config then switch to localhost.
			if (mongoConnectionString === "mongodb://") {

				global.config.mongo = [];
				global.config.mongo.push({
					host: "localhost",
					port: "27017"
				});

				mongoConnectionString += "localhost:27017";
				mongoConnectionString += ",";
			}

			mongoConnectionString = mongoConnectionString.substring(0, mongoConnectionString.length - 1);
			mongoConnectionString += "/"; //de limitter.
			global.keys.mongoConnectionString = mongoConnectionString;

			console.log("MongoDb connection string:" + global.keys.mongoConnectionString);

			if (isReplicaSet) {
				console.log("MongoDB is in ReplicaSet");
				var str = "?replicaSet=cloudboost&slaveOk=true&maxPoolSize=200&ssl=false&connectTimeoutMS=30000&socketTimeoutMS=30000&w=1&wtimeoutMS=30000";
				global.keys.mongoConnectionString += str;
			}

			mongoClient.connect(global.keys.mongoConnectionString, function (err, db) {
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

		} catch (err) {
			global.winston.log('error', { "error": String(err), "stack": new Error().stack });
		}
	}

	//Routes
	function attachAPI() {
		try {
			require('./api/analytics')();
			require('./api/userAnalytics')();
			require('./api/server')();
			require('./api/payments')();
			require('./api/appPlans')();
		} catch (e) {
			console.log(e);
			global.winston.log('error', { "error": String(e), "stack": new Error().stack });
		}
	}

	//Services
	function attachServices() {
		try {
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
		} catch (e) {
			console.log(e);
			global.winston.log('error', { "error": String(e), "stack": new Error().stack });
		}
	}

	setUpMongoDB();

	return app;
};
