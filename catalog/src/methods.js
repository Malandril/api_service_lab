'use strict';
const util = require('util');
let methods = {
    listMeals: function (msg, producer, db) {

        console.log("listMeals: " + msg);

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
                // console.log("Send msg: " + JSON.stringify(res) + " id " + msg.requestId);
                if (err) {
                    console.log(err);
                }
                console.log(res)
                producer.send({
                    "topic": "meals_listed",
                    "messages": [{"key": "", "value": JSON.stringify({"meals": res, requestId: msg.requestId})}]
                });
            });
    },
    addFeedback: function (msg, db) {
        console.log("addFeedback: " + msg);

        if (!("mealId" in msg && "rating" in msg && "customerId" in msg && "desc" in msg)) {
            console.log("Error : Malformed feedback");
            return;
        }
        db.collection('meals').findOneAndUpdate(
            {"id": msg.mealId},
            {$push: {feedbacks: {"rating": msg.rating, "customerId": msg.customerId, "desc": msg.desc}}}
        );
    },
    listFeedback: function (msg, producer, db) {

        console.log("listFeedback: " + msg);

        if (!"restaurantId" in msg) {
            console.log("Error : Malformed message");
            return;
        }

        db.collection('meals')
            .find({"restaurant.id": msg.restaurantId})
            .project({_id: 0, eta: 0, price: 0, restaurant: 0})
            .toArray((err, res) => {
                let value = JSON.stringify({"meals": res, requestId: msg.requestId});
                // console.log("Send msg: " + JSON.stringify(value));
                producer.send({
                    "topic": "feedback_listed",
                    "messages": [{"key": "", "value": value}]
                });
            });
    }
};

module.exports = methods;