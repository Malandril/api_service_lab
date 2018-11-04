'use strict';
const util = require('util');


function payment_failed(producer, msg) {
    console.log("payment failed");
    producer.send({
        topic: "payment_failed",
        messages: [{key: "", value: {orderId: JSON.stringify(msg.orderId)}}]
    });
}

let methods = {
    submitOrder: function (msg, db, producer) {
        console.log("processing order payment");
        if (msg.creditCard) {
            console.log(`contacting bank of ${msg.creditCard.name} ${msg.creditCard.number}`);
            let collection = db.collection('payments');

            collection.findOne({"orderId": msg.orderId}).then(value => {
                console.log("found:", value);
                if (!value) {
                    payment_failed(producer, msg);
                    return;
                }
                collection.findOneAndUpdate({"orderId": msg.orderId}, {
                    $set: {
                        from: msg.creditCard,
                        payed: true
                    }
                }).then(value => {
                        console.log(`payment of ${JSON.stringify(value)} euros succeeded`);
                        producer.send({
                            topic: "payment_succeeded",
                            messages: [{key: "", value: {orderId: msg.orderId}}]
                        }, reason => {
                            payment_failed(producer, msg);
                        });
                    }
                );
            })


        } else {
            payment_failed(producer, msg);
        }
    },
    priceComputed: function (msg, db) {
        db.collection('payments').insertOne({
                orderId: msg.orderId,
                amount: msg.price,
                payed: false
        }, function (err, r) {
            console.log("added : " + r);
        });
    }
};

module.exports = methods;