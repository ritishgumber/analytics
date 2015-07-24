module.exports = function() {

    //Api to store Data from Data Services
    global.app.post('/store',function(req,res){
        var id = global.cassandra.types.TimeUuid.now();
        if(req.body.method) {
            var method = req.body.method;
            var time = new Date().getTime();
            var appId = req.body.appId;
            //type is the host or name of the box where the service is running
            var type = req.body.type;
            //userid of the apps made by developers not for us, can be used to give customer analytics
            var userId = req.body.userId;
            //just to support inequality queries
            var dummy = "abc";
            var query = "INSERT into requests (id,method,time,appid,host,userid,dummy) values (?,?,?,?,?,?,?)";
            var params = [id,method,time,appId,type,userId,dummy];
            record(query,params,1);
            query = "update counter set value = value +1 where name = ?";
            params = ["apiCount"];
            record(query,params,1);
            res.status(200).send("Success");
        }else{
            res.status(400).send("Unknown Request");
        }
    });



// For querying on Counter table just pass in the body the name of counter which is required

    global.app.post('/count',function (req,res) {
        var name = req.body.name;
        var query = "select * from counter where name = ?";
        var params =[];
        params.push(name);
        global.analytics.document.find(query,params).then(function(result){
            console.log(result.rows[0].value);
            res.status(200).send(result.rows[0].value);
        },function(err){
            res.status(400).send(err);
        });
    });

// Api to send back 10 Days API Count Data
    global.app.post('/apiGraph',function(req,res){
       var currTime = new Date().getTime()-(10*24*60*60*1000);
        var query = "select date,requests from apiPerDay where date > ? and dummy = ? ALLOW FILTERING";
        var params = [currTime,global.keys.dummy];
        global.analytics.document.find(query,params).then(function(result){
            result = result.rows;
            result.sort(function(a,b){return a.date- b.date;});
            console.log(result);
            res.status(200).send(result);
        },function(err){
            res.status(400).send(err);
        });

    });

// Api to get 10 Days Active APP Count
    global.app.post('/apiActiveApps',function(req,res){
        var currTime = new Date().getTime()-(24*60*60*1000);
        var query = "select date,activeApps from activeApps where date > ? and dummy = ? ALLOW FILTERING";
        var params = [currTime,global.keys.dummy];
        global.analytics.document.find(query,params).then(function(result){
            result = result.rows;
            result.sort(function(a,b){return a.date- b.date;});
            res.status(200).send(result);
        },function(err){
            res.status(400).send(err);
        });
    });

// Api to get 10 Days data for requests received method wise
    global.app.post('/apiMethodStats',function(req,res){
        var currTime = new Date().getTime()-(24*60*60*1000);
        var query = "select date,requests,method from methodWiseApiCount where date > ? and dummy = ? ALLOW FILTERING";
        var params = [currTime,global.keys.dummy];
        global.analytics.document.find(query,params).then(function(result){
            result = result.rows;
            result.sort(function(a,b){return a.date- b.date;});
            res.status(200).send(result);
        },function(err){
            res.status(400).send(err);
        });
    });

    global.app.post('/apiAppStats',function(req,res){
        var currTime = new Date().getTime()-(24*60*60*1000);
        var query = "select date,appid,host,requests from appWiseApiCount where date > ? and dummy = ? ALLOW FILTERING";
        var params = [currTime,global.keys.dummy];
        global.analytics.document.find(query,params).then(function(result){
            result = result.rows;
            result.sort(function(a,b){return a.date- b.date;});
            res.status(200).send(result);
        },function(err){
            res.status(400).send(err);
        });
    });


};

function record(query,params,count){
    global.analytics.document.insert(query,params).then(function(response){
        if(response === "success")
            console.log("Data Stored");
    },function(err) {
        if(count<3) {
            count = count+1;
            record(query,params,count);
        }
    });
}