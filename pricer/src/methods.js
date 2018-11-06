'use strict';
const util = require('util');


function pricer_failed(producer, msg) {
    console.log("pricer failed");
    producer.send({
        topic: "pricer_failed",
        messages: [{key: "", value: {orderId: JSON.stringify(msg.orderId)}}]
    });
}

let methods = {
    submitOrder: function (msg, db, producer) {
        console.log("processing order pricer");
        if (msg.creditCard) {
            console.log(`contacting bank of ${msg.creditCard.name} ${msg.creditCard.number}`);
            let collection = db.collection('pricers');

            collection.findOne({"orderId": msg.orderId}).then(value => {
                console.log("found:", value);
                if (!value) {
                    pricer_failed(producer, msg);
                    return;
                }
                collection.findOneAndUpdate({"orderId": msg.orderId}, {
                    $set: {
                        from: msg.creditCard,
                        payed: true
                    }
                }).then(value => {
                        console.log(`pricer of ${JSON.stringify(value)} euros succeeded`);
                        producer.send({
                            topic: "pricer_succeeded",
                            messages: [{key: "", value: {orderId: msg.orderId}}]
                        }, reason => {
                            pricer_failed(producer, msg);
                        });
                    }
                );
            })


        } else {
            pricer_failed(producer, msg);
        }
    },
    priceComputed: function (msg, db) {
        db.collection('pricers').insertOne({
                orderId: msg.orderId,
                amount: msg.price,
                payed: false
        }, function (err, r) {
            console.log("added : " + r);
        });
    }
};

module.exports = methods;