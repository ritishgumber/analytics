module.exports = function(){

    var obj = {};

    obj.document = {

        find: function (query, params) {
            var deferred = global.q.defer();
            global.cassandraClient.execute(query, params, {prepare: true}, function (err, result) {
                if (!err) {
                    console.log(result);
                    deferred.resolve(result);
                } else {
                    console.log(err);
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        },


        insert: function (query, params) {
            var deferred = global.q.defer();
            global.cassandraClient.execute(query, params, {prepare: true}, function (err, result) {
                if (!err) {
                    console.log(result);

                    deferred.resolve("success");
                } else {
                    console.log(err);
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        }
    };

    return obj;


};
