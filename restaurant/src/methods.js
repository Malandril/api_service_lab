'use strict';
const util = require('util');
let methods = {
    finaliseOrder: function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        console.log("finaliseOrder: " + msg_string);

        if (!("order" in msg && "id" in msg.order && "meals" in msg.order)) {
            console.log("Error : Malformed order");
            return;
        }
        var restaurantId;
        var meals = [];
        msg.order.meals.forEach((meal) => {
            if (!("name" in meal && "id" in meal && "restaurant" in meal && "id" in meal.restaurant)) {
                console.log("Error : Malformed meal");
            } else {
                restaurantId = meal.restaurant.id;
                meals.push({"id": meal.id, "name": meal.name});
            }
        });
        var order = {"orderId": msg.order.id, "restaurantId": restaurantId, "meals": meals, "status": "todo"};
        db.collection('restaurants').insertOne(order);
        console.log("Inserted: " + JSON.stringify(order))
    },
    getMeals: function (msg_string, producer, db) {
        var msg = JSON.parse(msg_string);
        console.log("getMeals: " + msg_string);

        if (!("restaurantId" in msg && "status" in msg)) {
            console.log("Error : Malformed message");
            return;
        }
        db.collection('restaurants')
            .find({"restaurantId": msg.restaurantId, "status": msg.status})
            .toArray((err, res) => {
                console.log("Send msg: " + JSON.stringify(res));
                producer.send({
                    "topic": "meals_getted",
                    "messages": [{"key": "", "value": JSON.stringify({"orders": res, requestId: msg.requestId})}]
                });
            });
    },
    mealCooked: function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        console.log("mealCooked: " + msg_string);
        if (!("order" in msg && "id" in msg.order)) {
            console.log("Error : Malformed message");
            return;
        }
        db.collection('restaurants').findOneAndUpdate(
            {"orderId": msg.order.id},
            {$set: {status: "cooked"}}
        );
    },
    orderDelivered: function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        db.collection('restaurants').findOneAndUpdate(
            {"orderId": msg.order.id},
            {$set: {status: "delivered"}}
        );

    },
    orderCanceled: function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        console.log("orderDelivered: " + msg_string);
        db.collection('restaurants').findOneAndUpdate(
            {"orderId": msg.orderId},
            {$set: {status: "todo"}}
        );
    }
};

module.exports = methods;