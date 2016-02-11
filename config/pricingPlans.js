module.exports = function(){
    return {
       plans:[{
       	id:1,
       	price:"00.00",
       	planName:"Free Plan",
            apiCalls:10000,
            storage:0.2,
            connections:100,
            boost:false
       },{
       	id:2,
       	price:"10.00",
       	planName:"Prototype Plan",
            apiCalls:50000,
            storage:1,
            connections:100,
            boost:false
       },{
       	id:3,
       	price:"49.00",
       	planName:"Launch Plan",
            apiCalls:150000,
            storage:5,
            connections:500,
            boost:true
       },{
       	id:4,
       	price:"149.00",
       	planName:"Bootstrap Plan",
            apiCalls:500000,
            storage:10,
            connections:10000,
            boost:true
       },{
       	id:5,
       	price:"449.00",
       	planName:"Scale Plan",
            apiCalls:2000000,
            storage:30,
            connections:10000,
            boost:true
       },{
       	id:6,
       	price:"1449.00",
       	planName:"Unicorn",
            apiCalls:5000000,
            storage:100,
            connections:10000,
            boost:true
       }]
    };
};


