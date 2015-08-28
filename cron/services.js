module.exports = function(){

    var obj = {};
    obj.document = {
        getRecords: function () {
            var deferred = global.q.defer();
            var currDate = new Date().getTime();
            var prevDate = currDate - 24 * 60 * 60 * 1000;
            var query = "select * from requests where time > ? and time < ? and dummy = ? LIMIT 500000 ALLOW FILTERING";
            var params = [prevDate, currDate, global.keys.dummy];
            global.analytics.document.find(query, params).then(function (result) {
                deferred.resolve(result.rows);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        },
        dayApiCount: function (data) {
            var deferred = global.q.defer();
            var currTime = new Date().getTime();
            var query = "Insert into apiPerDay (id,date,requests,dummy) values (?,?,?,?)";
            var id = global.cassandra.types.TimeUuid.now();
            var params = [id, currTime, data.length,global.keys.dummy];
            global.analytics.document.insert(query, params).then(function (result) {
                deferred.resolve(result);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        },
        activeApps: function(data) {
            var deferred = global.q.defer();
            var markedApps =[];
            var markedHosts = [];
            var activeApps = 0;
            for (var i=0;i<data.length;i++){
                if(markedApps.indexOf(data[i].appid) === -1 || markedHosts.indexOf(data[i].host)=== -1){
                    markedApps.push(data[i].appid);
                    markedHosts.push(data[i].host);
                    activeApps = activeApps + 1;
                }
            }
            var id = global.cassandra.types.TimeUuid.now();
            var currTime = new Date().getTime();
            var query = "insert into activeApps (id,Date,activeApps,dummy) values (?,?,?,?)";
            var params = [id,currTime,activeApps,global.keys.dummy];
            global.analytics.document.insert(query,params).then(function(result){
               deferred.resolve(result);
            },function(err){
                deferred.reject(err);
            });
            return deferred.promise;
        },
        appWiseCount: function(data){
            var deferred = global.q.defer();
            var entry = false;
            var markedEntry = [];
            for(var i=0;i<data.length;i++){
                entry = false;
                for(var j=0;j<markedEntry.length;j++) {
                    if (markedEntry[j].appid === data[i].appid && markedEntry[j].host === data[i].host) {
                        entry = true;
                        markedEntry[j].count = markedEntry[j].count + 1;
                        j = markedEntry.length;
                    }
                }
                if(entry === false){
                    var obje = {};
                    obje.appid = data[i].appid;
                    obje.host = data[i].host;
                    obje.count = 1;
                    markedEntry.push(obje);
                }
            }
            var promises = [];
            for(var i=0;i<markedEntry.length;i++){
                var currDate = new Date().getTime();
                var id = global.cassandra.types.TimeUuid.now();
                var query = "insert into appWiseApiCount (id,appid,requests,date,host,dummy) values (?,?,?,?,?,?)";
                var params = [id,markedEntry[i].appid,markedEntry[i].count,currDate,markedEntry[i].host,global.keys.dummy];
                promises.push(global.analytics.document.insert(query,params));
        }
            global.q.all(promises).then(function(result){
                deferred.resolve(result);
            },function(err){
                console.log(err);
                deferred.reject(err);
            });
            return deferred.promise;
        },
        methodWiseApiCount: function(data){
            var deferred = global.q.defer();
            var reqStats = {};
            for(var i=0;i<data.length;i++){
                var method = data[i].method;
                if(Object.keys(reqStats).indexOf(method) != -1){
                    reqStats[method] = reqStats[method] + 1;
                }else{
                    reqStats[method]=1;
                }
            }
            var promises =[];
            var keys = Object.keys(reqStats);
            for(var i=0 ;i<keys.length;i++){
                var currDate = new Date().getTime();
                var id = global.cassandra.types.TimeUuid.now();
                var query = "insert into methodWiseApiCount (id,date,method,requests,dummy) values (?,?,?,?,?)";
                var params =[id,currDate,keys[i],reqStats[keys[i]],global.keys.dummy];
                promises.push(global.analytics.document.insert(query,params));
            }
            global.q.all(promises).then(function(result){
                deferred.resolve(result);
            },function(err){
                console.log(err);
                deferred.reject(err);
            });
            return deferred.promise;
        }
    };
    return obj;
};