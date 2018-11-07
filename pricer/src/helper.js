module.exports = {send_price_computed, findVoucherByCodeRestaurant};

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