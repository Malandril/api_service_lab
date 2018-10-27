'use strict';
const util = require('util');
let methods = {
    listMeals: function (msg_string, producer, db) {
        var msg = JSON.parse(msg_string);

        console.log("listMeals: " + msg_string);

        var query = {};

        if ("categories" in msg)
            query["category"] = {$in: msg.categories};
        if ("restaurants" in msg)
            query["restaurant.name"] = {$in: msg.restaurants};

        console.log("Running query " + JSON.stringify(query));
        db.collection('meals')
                .find(query)
                .project({_id: 0, feedback: 0})
                .toArray((err, res) => {
                    console.log("Send msg: " + JSON.stringify(res));
                    producer.send({
                        "topic":"meals_listed",
                        "messages": [{"key":"", "value": JSON.stringify({"meals": res})}]
                    });
                });
    },
    listFeedback: function (msg_string, producer, db) {
        var msg = JSON.parse(msg_string);

        console.log("listFeedback: " + msg_string);

        if (!"restaurantId" in msg) {
            console.log("Error : Malformed message");
            return;
        }

        db.collection('meals')
                .find({"restaurant.id": msg.restaurantId})
                .project({_id: 0, eta: 0, price: 0, restaurant:0})
                .toArray((err, res) => {
                    console.log("Send msg: " + JSON.stringify(res));
                    producer.send({
                        "topic":"feedback_listed",
                        "messages": [{"key":"", "value": JSON.stringify({"meals": res})}]
                    });
                });
    },
    addFeedback : function (msg_string, db) {
        var msg = JSON.parse(msg_string);
        console.log("finaliseOrder: " + msg_string);

        if (!("mealId" in msg && "rating" in msg.order && "customerId" in msg.order && "desc" in msg.order)) {
            console.log("Error : Malformed feedback");
            return;
        }
        db.collection('meals').findOneAndUpdate(
            {"id": msg.mealId},
            {$push: {"rating": msg.rating, "customerId": msg.customerId, "desc": msg.desc}}
        );
    }
};

module.exports = methods;