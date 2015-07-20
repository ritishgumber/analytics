var CronJob = require('cron').CronJob;
var job= new CronJob('20 20 20 * * *', function(){
        console.log('yes it began');
        global.cronServices.document.getRecords().then(function(data){
            runCronJob(data);
        }, function(err) {
            console.log(err);
        });

    },
    null,false, "America/Los_Angeles");

function runCronJob(data){
    var promises =[];
    promises.push(global.cronServices.document.dayApiCount(data));
    promises.push(global.cronServices.document.activeApps(data));
    promises.push(global.cronServices.document.appWiseCount(data));
    promises.push(global.cronServices.document.methodWiseApiCount(data));
    global.q.all(promises).then(function(result){
        console.log(result);
        console.log(done);
    },function(err){
        console.log(err);
    });
}
job.start();