'use strict';
const util = require('util');
let methods = {
    addOrder: function (msg, db) {
        console.log("added : " + util.inspect(msg, {showHidden: false, depth: null}));
        if (!("order" in msg) || !("meals" in msg.order)) {
            console.log("Error : Not enough data")
        } else {
            db.collection('orders').insertOne(msg.order, function (err, r) {
                console.log("added : " + r);
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer, db) {
        if ("coursier" in msg && "address" in msg.coursier) {
            var id = msg.coursier.address.split(" ");
            var orders = [];
            db.collection('orders').find({}).limit(1000).each(function (err, doc) {
                console.log("getOrderedToBeDelivered found ", doc);
                if (doc) {

                    orders.push(doc);
                } else {
                    let resp = {
                        requestId: msg.requestId,
                        orders: orders
                    };
                    console.log("send event to list_orders_to_be_delivered" + JSON.stringify(resp));
                    producer.send({
                        topic: "list_orders_to_be_delivered",
                        messages: [{key: "", value: JSON.stringify(resp)}]
                    });
                }
            });

        } else {
            console.log("Error : Not enough data : need {coursier:{id}}");
        }
        console.log(msg);
    },

    deleteOrder: function (msg, db) {
        db.collection('orders').deleteOne(msg, function (err, r) {
            console.log("deleted : " + r);
        });
    },

    updateLocalisation: function (msg, db) {
        db.collection('tracks').findOneAndUpdate({"id": msg.orderId}, {$set: {geoloc: msg.geoloc}}, {"upsert": true});
    },
    getLocalisation: function (msg, db, producer) {
        console.log("Asking location and ETA for :", msg);
        db.collection('tracks').findOne({"id": msg.orderId}, function (err, result) {
            if (err) throw err;
            console.log("Get location : ", result);
            var x1 = parseFloat(msg.geoloc.lat);
            var y1 = parseFloat(msg.geoloc.long);
            var x2 = parseFloat(result.geoloc.lat);
            var y2 = parseFloat(result.geoloc.long);
            result.eta = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            console.log("New ETA : ", result.eta);
            producer.send({
                topic: "order_tracker",
                messages: [{key: "", value: JSON.stringify(result)}]
            });
        });
    }


};

module.exports = methods;