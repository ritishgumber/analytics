var express = require('express');
var bodyParser = require('body-parser');
var multer =require('multer');
global.isDevelopment = process.env.PORT ? false:true;
global.q = require('q');
global.keys = require('./config/keys.js')();
global.app = express();
global.cassandra = require('cassandra-driver');
//Why this line
var http = require('http').Server(global.app);
app.set('port', process.env.PORT || 5555);
global.app.use('/',express.static(__dirname + '/interface'));
global.app.use(multer({
    dest: './uploads/'
}));
global.app.use(bodyParser.urlencoded({extended:true}));
function attachAPI(){
    require('./api/analytics.js')();
}
function attachServices(){
    global.analytics = require('./database/cassandra.js')();
    global.cronServices = require('./cron/services.js')();
}

function cassandraConnect(){
    global.cassandraClient = new global.cassandra.Client({contactPoints: global.keys.cassandraUrl, keyspace: global.keys.cassandraKeySpace});
    global.cassandraClient.connect(function(err,response){
        if(err)
            console.log("Cassandra is Down");
        else
            console.log("Cassandra is Up");
    });
}

http.listen(app.get('port'), function() {
    console.log('Starting Server');
    attachAPI();
    attachServices();
    cassandraConnect();
    console.log("server started");
});
require('./cron/cron.js');

