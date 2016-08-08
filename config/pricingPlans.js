module.exports = function(){
    return {
       plans:[{
       	id:1,
       	price:"00.00",
       	planName:"Free Plan",
            apiCalls:10000,
            storage:0.2,
            connections:100,
            mongoDbAccess:false
       },{
       	id:2,
       	price:"49.00",
       	planName:"Launch Plan",
            apiCalls:250000,
            storage:5,
            connections:500,
            mongoDbAccess:true
       },{
       	id:3,
       	price:"149.00",
       	planName:"Bootstrap Plan",
            apiCalls:1000000,
            storage:10,
            connections:10000,
            mongoDbAccess:true
       },{
       	id:4,
       	price:"449.00",
       	planName:"Scale Plan",
            apiCalls:5000000,
            storage:30,
            connections:10000,
            mongoDbAccess:true
       },{
       	id:5,
       	price:"1449.00",
       	planName:"Unicorn",
            apiCalls:10000000,
            storage:100,
            connections:10000,
            mongoDbAccess:true
       }]
    };
};


