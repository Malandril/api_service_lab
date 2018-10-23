'use strict';
const util = require('util');
let methods = {
    finaliseOrder : function (msg_string, db) {
        var msg = JSON.parse(msg_string);

        if (!("order" in msg && "id" in msg.order && "meals" in msg.order)) {
            console.log("Error : Malformed order");
            return;
        }
        var restaurantId;
        var order = {"id": msg.order.id, "meals": []};
        msg.order.forEach((meal) => {
            if (!("name" in meal && "id" in meal && "restaurant" in meal && "id" in meal.restaurant)) {
                console.log("Error : Malformed meal");
            } else {
                restaurantId = meal.restaurant.id;
                order.meals.push({"id": meal.id, "name": meal.name});
            }
        });
        db.collection('restaurants').findOneAndUpdate(
                {"id": restaurantId},
                {$push: {"orders": order}}
        );
    },
    getTodoMeals: function (msg_string, producer, db) {
        var msg = JSON.parse(msg_string);

        if (!("restaurantId" in msg)) {
            console.log("Error : Malformed message");
            return;
        }
        var orders = db.collection.findOne(
                {"id": restaurantId},
                {_id: 0}
        );
        producer.send({
            topic:"list_orders_to_be_delivered",
            messages: [{key:"", value: JSON.stringify({"orders": orders})}]
        });
    },

    orderDelivered: function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        if (!("order" in msg && "id" in msg.order)) {
            console.log("Error : Malformed message");
            return;
        }
        db.collection('orders').findOneAndDelete({"id": msg.order.id});
    }
};

module.exports = methods;