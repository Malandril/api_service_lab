'use strict';
const util = require('util');
let methods = {
    addOrder: function (msg, db) {
        msg.order.assigned = false;
        console.log("added : " + util.inspect(msg, {showHidden: false, depth: null}));
        if (!("order" in msg) || !("meals" in msg.order)) {
            console.error("Error : Not enough data")
        } else {
            db.collection('orders').insertOne(msg.order, function (err, r) {
                if(err) throw err;
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer, db) {
        if ("coursier" in msg && "address" in msg.coursier) {
            var orders = [];
            db.collection('orders').find({}).limit(1000).each(function (err, doc) {
                if (doc) {
                    orders.push(doc);
                } else {
                    let resp = {
                        requestId: msg.requestId,
                        orders: orders
                    };
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
        db.collection('orders').deleteOne({"id": msg.order.id}, function (err, r) {
            console.log("deleted : " + r);
        });
    },

    updateLocalisation: async function (msg, db) {
        console.log(JSON.stringify(msg));
        await db.collection('orders').findOneAndUpdate({"id": msg.orderId}, {$set: {geoloc: msg.geoloc}}, {"upsert": true}, (err, res) => {
            console.log("update", err, res);
        });
        console.log("sent update");

    },
    getLocalisation: function (msg, db, producer) {
        console.log("Asking location and ETA for :", msg);
        db.collection('orders').findOne({"id": msg.orderId}, function (err, result) {
            if (err) throw err;
            console.log("Get location:", result);
            let eta;
            if (!result) {
                var x1 = parseFloat(msg.geoloc.lat);
                var y1 = parseFloat(msg.geoloc.long);
                var x2 = parseFloat(result.geoloc.lat);
                var y2 = parseFloat(result.geoloc.long);
                eta = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            } else {
                eta = 99999;
                result = {geoloc: {lat: 0, long: 0}}
            }
            console.log("New ETA : ", result.eta);
            producer.send({
                topic: "order_tracker",
                messages: [{
                    key: "",
                    value: JSON.stringify({eta: eta, requestId: msg.requestId, geoloc: result.geoloc})
                }]
            });
        });
    },
    assign: function (msg, db) {
        console.log("msg order:", msg.orderId);
        db.collection('orders').findOneAndUpdate({"id": msg.orderId}, {
            $set: {
                assigned: true
            }
        })
            .then(val => console.log("assign worked", JSON.stringify(val)))
            .catch(err => {
                console.log("assign worked err ", JSON.stringify(err));
                throw err
            });
    },
    disassign: function (msg, db) {
        console.log("msg order:", msg.orderId);
        db.collection('orders').findOneAndUpdate({"id": msg.orderId}, {
            $set: {
                assigned: false
            }
        })

            .then(val => console.log("disassign worked", JSON.stringify(val)))
            .catch(err => {
                console.log("disassign didnt worked", JSON.stringify(err));
                throw err
            });
    },


};

module.exports = methods;