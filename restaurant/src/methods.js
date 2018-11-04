'use strict';
const util = require('util');
let methods = {
    finaliseOrder : function (msg_string, db) {
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
        var order = {"orderId": msg.order.id, "restaurantId": restaurantId, "meals": meals};
        db.collection('restaurants').insertOne(order);
        console.log("Inserted: " + JSON.stringify(order))
    },
    getTodoMeals: function (msg_string, producer, db) {
        var msg = JSON.parse(msg_string);

        console.log("getTodoMeals: " + msg_string);

        if (!("restaurantId" in msg)) {
            console.log("Error : Malformed message");
            return;
        }
        db.collection('restaurants')
                .find({"restaurantId": msg.restaurantId})
                .project({_id: 0, restaurantId: 0})
                .toArray((err, res) => {
                    console.log("Send msg: " + JSON.stringify(res));
                    producer.send({
                        "topic":"todo_meals",
                        "messages": [{"key":"", "value": JSON.stringify({"orders": res})}]
                    });
                });
    },

    orderDelivered: function (msg_string, db) {
        // TODO not the right event, should do that on meal_cooked
        var msg = JSON.parse(msg_string);
        console.log("orderDelivered: " + msg_string);
        if (!("order" in msg && "id" in msg.order)) {
            console.log("Error : Malformed message");
            return;
        }
        db.collection('orders').findOneAndDelete({"id": msg.order.id});
    }
};

module.exports = methods;