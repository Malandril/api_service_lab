'use strict';
const util = require('util');
let methods = {
    putNewStatus: function (msg, db, status) {
        msg.status = status;
        db.collection('orderStatus').insertOne(msg, function (err, r) {
            if (err) {
                console.log(util.inspect(err));
            } else {
                console.log("Add status "+status+" for order " + r["order"]+ " in db");
            }
        });
    },
    createStatistics: function (msg, db, producer) {
        var coursierMap = new Map();
        var finalisedOrders = db.collection('orderStatus')
            .find({status: "finalise_order", 'order.meals[0].restaurant.id': msg.restaurantId})
            .toArray();
        var assignedOrders = db.collection('orderStatus')
            .find({status: "assign_delivery"})
            .toArray();
        finalisedOrders.forEach(function (finalisedOrder) {
            assignedOrders.forEach(function (assignedOrder) {
                if (finalisedOrder.order.id === assignedOrder.orderId) {
                    var coursierId = assignedOrder.coursierId;
                    var orderId = finalisedOrder.order.id;


                    var deliveredOrder = db.collection('orderStatus').findOne({status: "order_delivered", 'order.id': orderId});
                    var cookedMeal = db.collection('orderStatus').findOne({status: "meal_cooked", 'order.id': orderId});
                    var difference = deliveredOrder.timestamp - cookedMeal.timestamp;
                    var time = new Date(difference*1000).getMinutes();
                    var date = new Date(finalisedOrder.timestamp*1000).toISOString();

                    var order = {
                        time: time,
                        date: date,
                        id: orderId,
                        meals: []
                    };
                    finalisedOrder.order.meals.forEach(function (meal) {
                        order.meals.push({id: meal.id})
                    })

                    if (!coursierMap.has(coursierId)) {
                        var value = {
                            id: coursierId,
                            orders : []
                        };
                        coursierMap.set(coursierId, value);
                    }
                    var temp = coursierMap.get(coursierId);
                    temp.orders.push(order);
                    coursierMap.set(coursierId, temp);
                }
            })
        })
        var result = {coursiers: []};
        coursierMap.forEach(function (value, key, map) {
            result.coursiers.push({
                id: key,
                orders : value
            });
        });
        console.log(result);
        producer.send({
            topic:"statistics",
            messages: [{key:"", value: JSON.stringify(result)}]
        });
    }
};

module.exports = methods;