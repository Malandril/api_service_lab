'use strict';
const util = require('util');
let methods = {
    createOrder: function (txt, db, producer) {
        var message = JSON.parse(txt);
        message.events = [{event: "creation",time: message.timestamp}];
        db.collection('orders').insertOne(message, function(err, r) {
            if(err){
                console.log(util.inspect(err));
            }else{
                console.log("Created " + r["insertedId"]+ " " + util.inspect(r));
                producer.send({
                    topic:"create_order",
                    messages: [{key:"", value: JSON.stringify({orderId: r["insertedId"]})}]
                });
            }
        });        
    },
    submitOrder: function (txt, db, producer) {
     var message = JSON.parse(txt);
     var id = message.order.id;
     var isFound = false;
      db.collection('orders').findOne({"_id":id},function(err,order) {
        if(err){
            console.log("err"+util.inspect(err));
            console.log("order "+util.inspect(order));
        }else{
            console.log("order "+util.inspect(order));
            message.events = value.events;
            message.events.push({event:"submit",time: message.timestamp});
            db.collection('orders').save(message);
        }
    });
 },
 addOrder : function (txt, db) {
    console.log("added : " +util.inspect(txt, {showHidden: false, depth: null}) )
    var msg = JSON.parse(txt);
    if(!("order" in msg) || !("meals" in msg.order)){
        console.log("Error : Not enough data")
    }else{
        db.collection('orders').insertOne(msg, function(err, r) {
         console.log("added : "+ r );
     });
    }
},
getOrderedToBeDelivered: function (msg, producer, db) {
    msg = JSON.parse(msg);
    if("coursier" in msg &&"address" in msg.coursier){
        var id = msg.coursier.address.split(" ");
        var orders = [];
        orders.push({id: 12,
            restaurant: {
                address:"1337 Rue du code"
            },
            customer: {
                address:"12 Rue du code"
            },
            mustBePayed: true});
        db.collection('orders').find({}).limit(10).each(function(err, doc) {
            if(doc){

                orders.push(doc);
            }else{
                let resp = {
                    orders:  orders
                };
                console.log("send event to list_orders_to_be_delivered" + JSON.stringify(resp) );
                producer.send({
                    topic:"list_orders_to_be_delivered",
                    messages: [{key:"", value: JSON.stringify(resp)}]
                });
                producer.send({
                    topic:"list_orders_to_be_delivered",
                    messages: [{key:"", value: JSON.stringify(resp)}]
                });
            }
        });

    }else{
        console.log("Error : Not enough data : need {coursier:{id}}");
    }
    console.log(msg);


},

deleteOrder: function (msg, db) {
    msg = JSON.parse(msg);
    db.collection('orders').deleteOne(msg, function(err, r) {
        console.log("deleted : "  + r);
    });
}
};

module.exports = methods;