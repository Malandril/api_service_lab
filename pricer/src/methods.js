'use strict';
const util = require('util');
const helper = require('./helper');


let methods = {
    addVoucher: function (data, db) {
        db.collection('vouchers').insertOne(data, function (err, r) {
            if (err) {
                console.log(util.inspect(err));
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
    createOrder: async function (data, db, producer) {
        const orderId = data.orderId;
        const requestId = data.requestId;
        let value = {
            requestId: requestId,
            orderId: orderId,
        };
        if (!data.meals) {
            console.log("create_order meals", data.meals);
            return;
        }
        const restaurantId = data.meals[0].restaurant.id;
        let totalPrice = 0;
        for (let i = 0; i < data.meals.length; i++) {
            if (!isNaN(data.meals[i].price)) {
                totalPrice += data.meals[i].price;
            }
        }
        if (data.voucher) {
            const code = data.voucher;
            await helper.findVoucherByCodeRestaurant(db, restaurantId, code).then(voucher => {
                if (!voucher) {
                    console.log("Voucher " + code + " not found.");
                    value.price = totalPrice;
                    helper.send_price_computed(producer, value);
                }
                else if (voucher.neededCategories && voucher.neededCategories.length !== 0) {
                    let meal_categories = data.meals.map(meal => {
                        if (meal.type)
                            return meal.type.toLowerCase();
                    });
                    if (voucher.neededCategories.every(category => {
                        let b = meal_categories.includes(category);
                        return b;
                    })) {
                        value.price = totalPrice * (1 - voucher.discount);
                        helper.send_price_computed(producer, value);
                    } else {
                        value.price = totalPrice;
                        helper.send_price_computed(producer, value)
                    }
                } else {
                    value.price = totalPrice * (1 - voucher.discount);
                    helper.send_price_computed(producer, value);
                }
            }).catch(reason => {
                console.log("Error when finding voucher", reason);
            })
        } else {
            console.log("no voucher");
            if (totalPrice !== 0) {
                value.price = totalPrice;
                helper.send_price_computed(producer, value);
            }
        }
    }
};

module.exports = methods;