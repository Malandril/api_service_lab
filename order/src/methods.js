'use strict';
const util = require('util');
var ObjectId = require('mongodb').ObjectID;
let methods = {
        createOrder: function (message, db, producer) {
            message.events = [{event: "creation", time: message.timestamp}];
            const requestId = message.requestId;

            delete message.requestId;
            db.collection('orders').insertOne(message, function (err, r) {
                if (err) {
                    console.log(util.inspect(err));
                } else {
                    message.orderId = r["insertedId"];
                    message.requestId = requestId;
                    producer.send({
                        topic: "create_order",
                        messages: [{key: "", value: JSON.stringify(message)}]
                    });
                }
            });
        },
        submitOrder: function (message, dbHelper, producer) {
            dbHelper.addEvent(message.order.id, {
                event: "submit",
                time: message.timestamp,
            });

        },
        processPaymentResult: function (succeed, message, dbHelper, producer) {
            let orderId = message.order.id;
            console.log("Payment of order " + orderId, "succeed : ", succeed);
            dbHelper.addEvent(orderId, {
                event: "payment",
                time: Math.round(new Date().getTime() / 1000),
                succeed: succeed
            });

            if (succeed) {
                dbHelper.db.collection('orders')
                    .find({"_id": new ObjectId(orderId)})
                    .forEach((res, err) => {
                        if (err) {
                            throw err;
                        }
                        res.id = res._id;
                        delete res._id;
                        delete res.events;
                        producer.send({
                            topic: "finalise_order",
                            messages: [{key: "", value: JSON.stringify({order:res})}]
                        });
                    });
            } else {
                //TODO: manage payment error
            }


        },
        logDeliveyAssignation: function (msg, dbHelper) {
            dbHelper.addEvent(msg.orderId, {event: "coursier_select", time: msg.timestamp, coursier: msg.coursierId})
        },
        logMealCooked: function (msg, dbHelper) {
            dbHelper.addEvent(msg.order.id, {event: "cooked", time: msg.time_stamp});
        },
        validateFinishOrder: function (msg, dbHelper) {
            console.log("Id = " + msg.order.id);
            dbHelper.addEvent(msg.order.id, {event: "delivered", time: msg.time_stamp});
            dbHelper.db.collection('orders')
                .find({"_id": msg.order.id})
                .forEach((err, res) => {
                    console.log(res);
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(res);
                    }
                });
        }
    }
;

module.exports = methods;