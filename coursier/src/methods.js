'use strict';
const util = require('util');
let methods = {
    addOrder : function (msg, db) {
        console.log("added : " +util.inspect(txt, {showHidden: false, depth: null}) )
        if(!("order" in msg) || !("meals" in msg.order)){
            console.log("Error : Not enough data")
        }else{
            db.collection('orders').insertOne(msg, function(err, r) {
               console.log("added : "+ r );
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer, db) {
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
    }


};

module.exports = methods;