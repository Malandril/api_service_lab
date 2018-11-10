'use strict';
const util = require('util');
let methods = {
    putNewStatus: function (msg, db, status) {
        msg.status = status;
        db.collection('orderStatus').findOne({status: status, 'order.id': msg.order.id}).then(value => {
            console.log("found:", value);
            if (!value) {
                msg.timestamp = msg.timestamp || Date.now();
                db.collection('orderStatus').insertOne(msg, function (err, r) {
                    if (err) {
                        console.log(util.inspect(err));
                    } else {
                        console.log("Add status " + status + " for order " + msg["order"] + " in db");
                    }
                });
                return;
            }
            let timestamp = msg.timestamp || Date.now();
            db.collection('orderStatus').findOneAndUpdate({status: status, 'order.id': msg.order.id}, {
                $set: {
                    timestamp: timestamp
                }
            }).then(value => {
                    console.log(value,"timestamp",timestamp);
                    console.log('Updated timestamp of order for statistics');
                }
            );
        })


    },
    calculateDeliveryTime: async function (msg, db) {
        let cookedMeal = await db.collection('orderStatus').findOne({status: "meal_cooked", 'order.id': msg.order.id});
        let finalisedOrder =await db.collection('orderStatus').findOne({status: "finalise_order", 'order.id': msg.order.id});
        let receive_stamp = msg.timestamp || Date.now();
        let difference = receive_stamp - cookedMeal.timestamp;
        let date = new Date(receive_stamp * 1000).toISOString();
        let meals = finalisedOrder.order.meals;
        let value = {
            coursierId: msg.coursierId,
            time: difference,
            date: date,
            meals: meals
        };
        db.collection('deliveryTime').insertOne(value, function (err, r) {
            if (err) {
                console.log(util.inspect(err));
            } else {
                console.log("Calculate and store delivery time for order");
            }
        });
    },
    pullStatistics:async function (msg, db, producer) {
        var coursierMap = new Map();

        var deliveries = await db.collection('deliveryTime').find().toArray();
        deliveries.forEach(function (delivery) {
            var coursierId = delivery.coursierId;
            if (!coursierMap.has(coursierId)) {
                var value = {
                    id: coursierId,
                    orders: []
                };
                coursierMap.set(coursierId, value);
            }
            var order = {
                time: delivery.time,
                date: delivery.date,
                meals: delivery.meals
            };
            var temp = coursierMap.get(coursierId);
            temp.orders.push(order);
            coursierMap.set(coursierId, temp);
        });
        var result = {coursiers: [], requestId: msg.requestId};
        coursierMap.forEach(function (value, key, map) {
            result.coursiers.push({
                id: key,
                orders: value
            });
        });
        console.log(result);
        producer.send({
            topic: "statistics",
            messages: [{key: "", value: JSON.stringify(result)}]
        });
    }
};

module.exports = methods;