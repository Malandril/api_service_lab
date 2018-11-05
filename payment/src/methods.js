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
    finaliseOrder: function (msg, db, producer) {
        console.log("processing order payment");
        if (msg.creditCard) {
            console.log(`contacting bank of ${msg.creditCard.name} ${msg.creditCard.number}`);
            let collection = db.collection('payments');

            let orderId = msg.order.id;
            collection.findOne({"orderId": orderId}).then(value=> {
                console.log("found:", value);
                if (!value) {
                    payment_failed(producer, msg);
                    return;
                }
                collection.findOneAndUpdate({"orderId": orderId}, {
                    $set: {
                        from: msg.creditCard,
                        payed: true
                    }
                }).then(value => {
                        console.log(`payment of ${JSON.stringify(value)} euros succeeded`);
                        producer.send({
                            topic: "payment_succeeded",
                            messages: [{key: "", value: JSON.stringify({order:{id: orderId}})}]
                        }).catch(() => payment_failed(producer, msg));
                    }
                ).catch(() => payment_failed(producer, msg));
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