global.isDevelopment = process.env.PORT ? false:true;
global.q = require('q');
global.keys = require('./config/keys.js')();

var app = require('./app')();
app.set('port', process.env.PORT || 5555);
var server = app.listen(app.get('port'), function(){
    console.log("Analytics started running on PORT:"+app.get('port'));
});
