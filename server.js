var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
global.isDevelopment = process.env.PORT ? false:true;
global.q = require('q');
global.keys = require('./config/keys.js')();
global.app = express();
var http = require('http').Server(global.app);
app.set('port', process.env.PORT || 5555);
global.app.use(cors());
global.app.use('/',express.static(__dirname + '/public'));
global.app.use(bodyParser.urlencoded({extended:true}));
global.app.use(bodyParser.json());

function attachAPI(){
    try{
       require('./api/analytics')();
    }catch(e){
        console.log(e);
    }
}
function attachServices(){
    global.analyticsService = require('./service/analytics.js');
}

function mongoConnect(){
                
        var mongoClient = require('mongodb').MongoClient;
        mongoClient.connect(global.keys.mongodb,function (err, db) {
            if (err) {
                console.log("Error connecting to MongoDB");
                console.log(err);
            } else {
                console.log("MongoDB connected.");
                global.mongoClient = db;
            }
        });
}

http.listen(app.get('port'), function() {
    console.log('Starting Server');
    mongoConnect();
    attachServices();
    attachAPI();
    console.log("Server started");
});

