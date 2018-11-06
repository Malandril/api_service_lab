module.export = {
    send_price_computed: function (producer, value) {
        producer.send({
            topic: "price_computed",
            messages: [{
                key: "", value: JSON.stringify(value)
            }]
        });
    }, findVoucherByCodeRestaurant: function (db, restaurantId, code) {
        return db.collection("vouchers").findOne({"restaurantId": restaurantId, "code": code});
    }
}