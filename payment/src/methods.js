'use strict';
const util = require('util');


function payment_failed(producer, orderId) {
    console.log("payment failed");
    producer.send({
        topic: "payment_failed",
        messages: [{key: "", value: {orderId: orderId}}]
    });
}

function pay(creditCard, price, orderId, producer) {
    console.log(`Contacting bank of ${creditCard.name} ${creditCard.number}`);
    console.log(`Payed ${price}`);
    producer.send({
        topic: "payment_succeeded",
        messages: [{key: "", value: JSON.stringify({order: {id:orderId}})}]
    }).catch(() => payment_failed(producer, orderId));
}

let methods = {
    submitOrder: function (msg, db, producer) {
        let orderId = msg.order.id;
        if (msg.creditCard) {

            let collection = db.collection('payments');
            collection.findOne({"orderId": orderId}).then(value => {
                if (!value) {
                    collection.insertOne({
                        orderId: msg.order.id,
                        payed: false,
                        creditCard: msg.creditCard
                    })
                } else if (!value.payed) {
                    pay(msg.creditCard, value.amount, orderId, producer);
                    collection.findOneAndUpdate({"orderId": orderId}, {
                        $set: {
                            creditCard: msg.creditCard,
                            payed: true
                        }
                    }).catch(() => payment_failed(producer, orderId));
                }
            })


        } else {
            payment_failed(producer, orderId);
        }
    },
    priceComputed: function (msg, db, producer) {
        let collection = db.collection('payments');
        collection.findOne({"orderId": msg.orderId}).then(value => {
            if (!value) {
                collection.insertOne({
                    orderId: msg.orderId,
                    amount: msg.price,
                    payed: false
                });
            } else if (!value.payed) {
                pay(value.creditCard, msg.price, msg.orderId, producer);
                collection.findOneAndUpdate({"orderId": msg.orderId}, {
                    $set: {
                        amount: msg.price,
                        payed: true
                    }
                }).catch(() => payment_failed(producer, msg.orderId));
            }
        });
    }
};

module.exports = methods;