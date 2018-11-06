'use strict';
const util = require('util');
const helper = require('./helper');

function send_price_computed(producer, value) {
    producer.send({
        topic: "price_computed",
        messages: [{
            key: "", value: JSON.stringify(value)
        }]
    });
}

function findVoucherByCodeRestaurant(db, restaurantId, code) {
    return db.collection("vouchers").findOne({"restaurantId": restaurantId, "code": code});
}

let methods = {
    addVoucher: function (data, db) {
        db.collection('vouchers').insertOne(data, function (err, r) {
            if (err) {
                console.log(util.inspect(err));
            } else {
                console.log("Add voucher " + data + " in db");
            }
        });
    },
    listVouchers: function (data, db, producer) {
        var vouchers = db.collection('vouchers').find({restaurantId: data.restaurantId}).toArray();
        let result = {
            vouchers: vouchers,
            restaurantId: data.restaurantId,
            requestId: data.requestId
        };
        producer.send({
            topic: "vouchers_listed",
            messages: [{
                key: "", value: JSON.stringify(result)
            }]
        });
    },
    createOrder: function (data, db, producer) {
        const orderId = data.orderId;
        const requestId = data.requestId;
        let value = {
            requestId: requestId,
            orderId: orderId,
        };
        const restaurantId = data.meals[0].restaurant.id;
        let totalPrice = 0;
        for (let i = 0; i < data.meals.length; i++) {
            totalPrice += data.meals[i].price;
        }
        if (data.voucher) {
            const code = data.voucher;
            helper.findVoucherByCodeRestaurant(db, restaurantId, code).then(voucher => {
                if (!voucher) {
                    console.log("Voucher " + code + " not found.");
                    value.price = totalPrice;
                    helper.send_price_computed(producer, value);
                    return;
                }
                else if (voucher.neededCategories) {
                    console.log("voucher has categories");
                    let meal_categories = data.meals.map(meal => meal.type.toLowerCase());
                    if (voucher.neededCategories.every(category => meal_categories.includes(category))) {
                        value.price = totalPrice * (1 - voucher.discount);
                        helper.send_price_computed(producer, value);
                    } else {
                        helper.send_price_computed(producer, totalPrice)
                    }
                } else {
                    value.price = totalPrice * (1 - voucher.discount);
                    helper.send_price_computed(producer, value);
                }
            }).catch(reason => {
                console.log("Error when finding voucher", reason);
            })
        } else {
            value.price = totalPrice;
            helper.send_price_computed(producer, value);
        }
    }
};

module.exports = methods;