'use strict';
const util = require('util');

function computeOrderPrice(msg) {
    return msg.order.meals.reduce(function (pv, cv) {
        return pv.price + cv.price
    });
}

let methods = {
    submitOrder: function (msg, db, producer) {
        msg = JSON.parse(msg);
        console.log("processing order payment");
        if (msg.creditCard) {
            console.log(`contacting bank of ${msg.creditCard.name} ${msg.creditCard.number}`);
            var price = computeOrderPrice(msg);
            console.log(`payment of ${price} euros succeeded`);
            db.collection('payments').insertOne({
                payment: {
                    from: msg.creditCard,
                    amount: price
                }
            }, function (err, r) {
                console.log("added : " + r);
                producer.send({
                    topic: "payment_succeeded",
                    messages: [{key: "", value: {order: {id: msg.order.id}}}]
                });
            });
        } else {
            console.log("payment refused");
            producer.send({
                topic: "payment_failed",
                messages: [{key: "", value: {order: {id: msg.order.id}}}]
            });
        }
    }
};

module.exports = methods;