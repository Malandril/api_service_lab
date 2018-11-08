'use strict';
const util = require('util');
let methods = {
    addOrder : function (msg, db) {
        msg.order.assigned = false;
        console.log("added : " +util.inspect(msg, {showHidden: false, depth: null}) )
        if(!("order" in msg) || !("meals" in msg.order)){
            console.log("Error : Not enough data")
        }else{
            db.collection('orders').insertOne(msg.order, function(err, r) {
               console.log("added : "+ r ,JSON.stringify(msg.order));
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer, db) {
        if("coursier" in msg &&"address" in msg.coursier){
            var id = msg.coursier.address.split(" ");
            var orders = [];
            db.collection('orders').find({}).limit(1000).each(function(err, doc) {
                console.log("found ",doc);
                if(doc){
                    orders.push(doc);
                }else{
                    let resp = {
                        requestId: msg.requestId,
                        orders:  orders
                    };
                    console.log("send event to list_orders_to_be_delivered" + JSON.stringify(resp) );
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
        db.collection('orders').deleteOne(msg, function(err, r) {
            console.log("deleted : "  + r);
        });
    },

    updateLocalisation: function (msg, db) {
        db.collection('tracks').replaceOne({"orderId" : msg.orderId}, msg,{"upsert": true});
    },
    getLocalisation: function (msg, db, producer) {
        db.collection('tracks').findOne({"orderId" : msg.orderId}, function(err, result) {
            if (err) throw err;
            console.log(result);
            producer.send({
                topic:"order_tracker",
                messages: [{key:"", value: JSON.stringify(result)}]
            });
        });
    },
    assign: function (msg, db) {
        db.collection('orders').findOneAndUpdate({"order.id": msg.orderId}, {
            $set: {
                assigned: true
            }
        })
            .then(val=>console.log("assign worked" + val))
            .then(err=>{throw err});
    },
    disassign: function (msg, db) {
        db.collection('orders').findOneAndUpdate({"order.id": msg.orderId}, {
            $set: {
                assigned: false
            }
        })
            .then(val=>console.log("disassign worked" + val))
            .then(err=>{throw err});
    },


};

module.exports = methods;