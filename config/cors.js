module.exports = function(){
    var cors = require('cors');

    var whitelist = ['http://localhost:1440'];
    var corsOptions = {
	  origin: function(origin, callback){
	    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
	    callback(null, originIsWhitelisted);
	  },
	  credentials:true
	};
	
    global.app.use(cors(corsOptions));
};

