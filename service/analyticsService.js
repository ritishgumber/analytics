var request = require('request');
var _ = require('underscore');
var pricingPlans = require('../config/pricingPlans.js')();

module.exports = {

    store : function(host, appId, category, subCategory,sdk){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            category=category.trim();
            if(subCategory){
               subCategory=subCategory.trim(); 
            }        

            var document = {
              host : host,
              appId : appId, 
              category : category, 
              subCategory : subCategory,
              timestamp : new Date().getTime(),
              sdk : sdk
            };
            
            collection.save(document,function(err,doc){
                if(err) {
                    console.log("Error while saving API");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log('++++ Object Updated +++');              

                    //Update UserApi Day and Monthly wise
                    global.userApiAnalyticsService.addRecord(host, appId);                 
                    global.userMonthlyApiService.addRecord(host, appId);

                    //isHosted
                    if(host==global.keys.hostedSecureKey){
                       _checkAppLimit(host,appId).then(function(response){
                            deferred.resolve(response);
                        },function(error){
                            console.log("App Check Limit error");
                            console.log(error);
                            
                            deferred.resolve({appId:appId,limitExceeded:false,message:"Error in computing whole process"});
                        }); 
                    }else{
                        deferred.resolve({appId:appId,limitExceeded:false,message:"Not a Hosted Services"});
                    }
                                  
                }
            });                      

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },

    totalApiCount : function(host, appId, category, subCategory, fromTime, toTime,sdk){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            var query = {};
            
            if(host)
                query.host = host;
            if(appId)
                query.appId = appId;
            if(category)
                query.category = category;
            if(subCategory)
                query.subCategory = subCategory;

            if(sdk)
                query.sdk = sdk;
                
            if(fromTime || toTime){
                
                query.timestamp = {};
                
                if(fromTime){
                    query.timestamp.$gt = Number(fromTime);
                }
                
                if(toTime){
                    query.timestamp.$lte = Number(toTime);
                }
            }
                
            collection.count(query, function(err,count){
                if(err) {
                    console.log("Error in counting API");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log('COUNT : '+count);
                    deferred.resolve(count);
                }
            });
        }catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    
    activeAppWithAPICount : function(fromTime, toTime, limit, skip, sdk,host){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            var pipeline = [];
            
            //add filters. 
            if(fromTime || toTime || sdk){
                var query = {};
                query.timestamp = {};
                if(fromTime){
                    query.timestamp.$gt = Number(fromTime);
                }
                
                if(toTime){
                    query.timestamp.$lt = Number(toTime);
                }
                
                if(sdk)
                    query.sdk = sdk;

                if(host)
                    query.host = host;
                pipeline.push({$match:query});
            }
            
            //group.
            var group = {
              $group : {
                    _id : "$appId",
                    apiCount: { $sum: 1}
                }  
            };
            
            pipeline.push(group);
            
           
            pipeline.push({$sort : {apiCount : -1}});
            
            
            if(skip){
                pipeline.push({$skip : Number(skip)});
            }
            
            if(limit){
                pipeline.push({$limit : Number(limit)});
            }
            
          
            collection.aggregate(pipeline, function(err,docs){
                if(err) {
                    console.log("Error in counting API");
                    console.log(err);
                    
                    //underscore query
                    
                    deferred.reject(err);
                }else{
                    console.log("Documents Retrieved.");
                    
                    //change _id to appId
                    for(var i=0;i<docs.length;i++){
                        docs[i].appId = docs[i]._id;
                        delete docs[i]._id;
                    }
                    
                    deferred.resolve(docs);
                }
            });

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    
    activeAppCount : function(fromTime, toTime,sdk,host){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            //add filters. 
            var query = {};
            if(fromTime || toTime || sdk){
                
                query.timestamp = {};
                
                if(fromTime){
                    query.timestamp.$gt = Number(fromTime);
                }
                
                if(toTime){
                    query.timestamp.$lt = Number(toTime);
                }

                if(sdk)
                    query.sdk = sdk;

                if(host)
                    query.host = host;
            }
            
            collection.distinct("appId", query, function(err,docs){
                if(err) {
                    console.log("Error in counting API");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log("Count : "+docs.length);
                    deferred.resolve(docs.length);
                }
            });

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },

    funnelAppCount : function(fromTime, toTime,apiCount,sdk,host){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            var pipeline = [];

            //add filters. 
            var query = {};
            if(fromTime || toTime || sdk){
                
                query.timestamp = {};
                
                if(fromTime){
                    query.timestamp.$gt = Number(fromTime);
                }
                
                if(toTime){
                    query.timestamp.$lt = Number(toTime);
                }

                if(sdk)
                   query.sdk = sdk;

                if(host)
                   query.host = host;

                pipeline.push({$match : query});
            }
            
           //group.
            var group = {
              $group : {
                    _id : "$appId",
                    apiCount: { $sum: 1}
                }  
            };
            
            pipeline.push(group);
            
           
            console.log(apiCount);

            pipeline.push({$match : {apiCount :{$gte:apiCount}}});
            
          
            collection.aggregate(pipeline, function(err,docs){
                if(err) {
                    console.log("Error in counting API");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log("Documents Retrieved."); 
                    deferred.resolve(docs.length);
                }
            });

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    
    categoryWithApiCount : function(fromTime, toTime, sdk,host){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);
            
            var pipeline = [];
            
            //add filters
            if(fromTime || toTime || sdk){
                var query = {};
                query.timestamp = {};
                if(fromTime){
                    query.timestamp.$gt = Number(fromTime);
                }
                
                if(toTime){
                    query.timestamp.$lt = Number(toTime);
                }

                if(sdk)
                  query.sdk = sdk;

                if(host)
                  query.host = host;
                
                pipeline.push({$match:query});
            }
            
            //group.
            var group = {
              $group : {
                    _id : "$category",
                    apiCount: { $sum: 1}
                }  
            };
            
            pipeline.push(group);
          
            collection.aggregate(pipeline, function(err,docs){
                if(err) {
                    console.log("Error in counting API");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log("Documents Retrieved.");
                    
                     //change _id to appId
                    for(var i=0;i<docs.length;i++){
                        docs[i].category = docs[i]._id;
                        delete docs[i]._id;
                    }
                    
                    deferred.resolve(docs);
                }
            });
        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    distinctApps : function(){
        
        var deferred= q.defer();
        
        try{
            var collection =  global.mongoClient.db(global.keys.dbName).collection(global.keys.apiNamespace);        
             
            collection.distinct("appId",function(err,docList){
                if(err) {
                    console.log("Error getting distinct AppIds");
                    console.log(err);
                    deferred.reject(err);
                }else{
                    console.log('++++ Object Updated +++');
                    deferred.resolve(docList);
                }
            });

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }
        
        return deferred.promise;
    },
    isAppReleased : function(host,appId){
        
        var deferred= q.defer(); 
        
        try{
            global.appPlansService.findAppPlan(host,appId).then(function(appPlanDoc){         
             
                if(appPlanDoc){

                    var promises=[];

                    //API calls 
                    promises.push(global.userMonthlyApiService.monthlyApiByAppId(appPlanDoc.host,appPlanDoc.appId,null));
                    //Storage 
                    promises.push(global.userStorageAnalyticsService.monthlyAnalyticsByAppId(appPlanDoc.host,appPlanDoc.appId,null));

                    q.all(promises).then(function(list){ 
                        var apiCalls=0;
                        var storage=0;            

                        if(list[0] && list[0].monthlyApiCount){
                            apiCalls=list[0].monthlyApiCount;
                        }
                        if(list[1] && list[1].totalStorage){
                            storage=list[1].totalStorage;
                        }

                        var over100Doc= _check100Percentage(appPlanDoc.appId,appPlanDoc.planId,apiCalls,storage);
                       
                        deferred.resolve(over100Doc);         
                                                 

                    }, function(err){    
                        deferred.resolve({appId:appId,limitExceeded:false,message:"Error in getting usage details"});
                    }); 
                }else{
                    deferred.resolve({appId:appId,limitExceeded:false,message:"PlanId not found"});
                }
                

            },function(error){
                deferred.resolve({appId:appId,limitExceeded:false,message:"Error in getting plan details"});
            });

        } catch(err){           
            global.winston.log('error',err);
            deferred.reject(err);
        }

        return deferred.promise;
    }  
    
       
};


function _checkAppLimit(host,appId){  
    var deferred= q.defer();

    try{
        global.appPlansService.upsertAppPlan(host,appId,null).then(function(appPlanDoc){        
            
            var promises=[];

            //API calls 
            promises.push(global.userMonthlyApiService.monthlyApiByAppId(appPlanDoc.host,appPlanDoc.appId,null));
            //Storage 
            promises.push(global.userStorageAnalyticsService.monthlyAnalyticsByAppId(appPlanDoc.host,appPlanDoc.appId,null));

            q.all(promises).then(function(list){ 
                var apiCalls=0;
                var storage=0;
                var connections=0
                var boost=0;

                if(list[0] && list[0].monthlyApiCount){
                    apiCalls=list[0].monthlyApiCount;
                }
                if(list[1] && list[1].totalStorage){
                    storage=list[1].totalStorage;
                }

                //var connections=list[0].monthlyApiCount;
                //var boost=list[0].monthlyApiCount;

                
                _check80Percentage(host,appPlanDoc.appId,appPlanDoc.planId,apiCalls,storage);
                var over100Doc= _check100Percentage(appPlanDoc.appId,appPlanDoc.planId,apiCalls,storage);
                deferred.resolve(over100Doc);

                if(over100Doc.limitExceeded){
                    _processNotifyFrontendOver100(host,appPlanDoc.appId,appPlanDoc.planId,over100Doc);
                }                         

            }, function(err){    
                deferred.reject(err);
            });


        },function(error){
            deferred.reject(error);
        });

    } catch(err){           
        global.winston.log('error',err);
        deferred.reject(err);
    }

    return deferred.promise;
}

function _check100Percentage(appId,planId,apiCalls,storage){ 

    try{ 

        var currentPlan=_.first(_.where(pricingPlans.plans, {id: planId}));   
        
        if(apiCalls!=0){       
            if(apiCalls>currentPlan.apiCalls){
                return {appId:appId,limitExceeded:true,message:"API Calls limit exceeded "+currentPlan.apiCalls+" for "+currentPlan.planName};
            }
        }    

        if(storage!=0){
            storage=(storage/1024);
            if(storage>currentPlan.storage){
                return {appId:appId,limitExceeded:true,message:"Storage limit exceeded "+currentPlan.storage+"(GB) for "+currentPlan.planName};
            }
        } 

        return {appId:appId,limitExceeded:false,message:"Okay"};

    } catch(err){ 

        global.winston.log('error',err);
        return {appId:appId,limitExceeded:false,message:"Error"};
    }     
}

function _check80Percentage(host,appId,planId,apiCalls,storage){

    try{
        var exceeded80=[];    

        var currentPlan=_.first(_.where(pricingPlans.plans, {id: planId}));
        var per80=(80/100);      

        if(apiCalls!=0){
            var apiCalls80Per=(currentPlan.apiCalls*per80);
            if(apiCalls>apiCalls80Per){
                var response={}
                response.over80=true;
                response.feature="API Calls";
                response.message="API calls over 80 percetnage of "+currentPlan.apiCalls+" of "+currentPlan.planName;
                exceeded80.push(response);
            }        
        }    

        if(storage!=0){
            storage=(storage/1024);

            var storage80Per=(currentPlan.storage*per80);
            if(storage>storage80Per){            
                var response={}
                response.over80=true;
                response.feature="Storage";
                response.message="Storage over 80 percetnage of "+currentPlan.storage+" of "+currentPlan.planName;
                exceeded80.push(response);
            }
        }

        if(exceeded80 && exceeded80.length>0 && global.keys.hostedSecureKey==host){

            global.notificationService.findByMonth(host,appId,"over80",new Date()).then(function(notifyDoc){

                if(!notifyDoc){
                    return _notifyFrontendOver80(host,appId,exceeded80);
                }else{
                    var defaultDeffred= q.defer();
                    defaultDeffred.resolve(null);
                    return defaultDeffred.promise;
                }

            }).then(function(resp){
                if(resp){
                    global.notificationService.insertOne(host,appId,"over80");
                }
                
            },function(error){
                console.log(error);
            });
        }

    } catch(err){           
        global.winston.log('error',err);        
    }
   
}

function _processNotifyFrontendOver100(host,appId,planId,details){
    try{
        if(global.keys.hostedSecureKey==host){

            global.notificationService.findByMonth(host,appId,"over100",new Date()).then(function(notifyDoc){            
                if(!notifyDoc){               
                    return _notifyFrontendOver100(host,appId,details);
                }else{
                    var defaultDeffred= q.defer();
                    defaultDeffred.resolve(null);
                    return defaultDeffred.promise;
                }

            }).then(function(resp){
                if(resp){
                    global.notificationService.insertOne(host,appId,"over100");
                }
                
            },function(error){
                console.log(error);
            });
        }
    } catch(err){           
        global.winston.log('error',err);
        console.log(err);
    }
}

function _notifyFrontendOver80(host,appId,exceeded80){
    var deferred = q.defer();
 
    try{

      var post_data = {};  
      post_data.exceeded80 = exceeded80;
      post_data.secureKey = host;
      post_data = JSON.stringify(post_data);


      var url = global.keys.frontendServiceUrl + '/'+appId+'/notifications/over80';  

      request.post(url,{
          headers: {
              'content-type': 'application/json',
              'content-length': post_data.length
          },
          body: post_data
      },function(err,response,body){
        
          if(err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error'){       
            deferred.reject(err);
          }else {    
            var respBody=JSON.parse(body);                           
            deferred.resolve(respBody);
          }
      });

    } catch(err){           
        global.winston.log('error',err);
        deferred.reject(err);
    }

  return deferred.promise;
}

function _notifyFrontendOver100(host,appId,details){
  var deferred = q.defer();

    try{
        
      var post_data = {};  
      post_data.details = details;
      post_data.secureKey = host;
      post_data = JSON.stringify(post_data);


      var url = global.keys.frontendServiceUrl + '/'+appId+'/notifications/over100';  

      request.post(url,{
          headers: {
              'content-type': 'application/json',
              'content-length': post_data.length
          },
          body: post_data
      },function(err,response,body){
          if(err || response.statusCode === 500 || response.statusCode === 400 || body === 'Error'){       
            deferred.reject(err);
          }else {    
            var respBody=JSON.parse(body);                           
            deferred.resolve(respBody);
          }
      });

    } catch(err){           
        global.winston.log('error',err);
        deferred.reject(err);
    }

  return deferred.promise;
}