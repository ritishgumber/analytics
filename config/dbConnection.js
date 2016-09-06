var mongoClient = require('mongodb').MongoClient;

module.exports = function(isDevelopment){
	mongoClient.connect(global.keys.mongodb,function (err, db) {
        if (err) {
            console.log("Error connecting to MongoDB");
            console.log(err);
        } else {            
            console.log("Database connected successfully");
            global.mongoClient = db;
        }
    })

	return mongoClient; 
}


 
        