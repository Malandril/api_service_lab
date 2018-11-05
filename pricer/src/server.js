'use strict';

let methods = require('./methods');
let config = require('./configuration');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);

const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'pricer',
});
const consumer = kafka.consumer({groupId: 'pricer'});
const producer = kafka.producer();
const consumers = ["create_order", "add_voucher", "list_vouchers"];
const run = async () => {
    await producer.connect();
    await consumer.connect();

    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log("Received from topic:", topic, data);
            switch (topic) {
                case "create_order":
                    var orderId = data.orderId;
                    var requestId = data.requestId;
                    let value ={
                        requestId: requestId,
                        orderId: orderId,
                    };
                    const restaurantId = data.meals[0].restaurant.id;
                    var totalPrice = 0;
                    for (var i = 0; i< data.meals.length; i++){
                        totalPrice += data.meals[i].price;
                    }
                    if("voucher"  in data && data["voucher"] !== ""){
                        const code = data.voucher;
                        mongoHelper.findVoucherByCodeRestaurant(restaurantId, code).then(val=>{
                            if(!val){
                                //TODO: manage voucher not found exception
                                console.log("Voucher "+ code + " not found.");
                                value.price =  totalPrice;
                                producer.send({
                                    topic: "price_computed",
                                    messages: [{
                                        key: "", value: JSON.stringify(value)
                                    }]
                                });
                                return;
                            }
                            value.price =  totalPrice * (1 -  val.discount);
                            producer.send({
                                topic: "price_computed",
                                messages: [{
                                    key: "", value:  JSON.stringify(value)
                                }]
                            });
                        })
                    }else{
                        value.price =  totalPrice;
                        producer.send({
                            topic: "price_computed",
                            messages: [{
                                key: "", value:  JSON.stringify(value)
                            }]
                        });
                    }
                    break;
                case "add_voucher":
                    mongoHelper.db.collection('vouchers').insertOne(data, function (err, r) {
                        if (err) {
                            console.log(util.inspect(err));
                        } else {
                            console.log("Add voucher "+data + " in db");
                        }
                    });
                    break;
                case "list_vouchers":

                    var vouchers = mongoHelper.db.collection('vouchers').find({restaurantId: data.restaurantId}).toArray();
                    let result = {
                        vouchers: vouchers,
                        restaurantId: data.restaurantId,
                        requestId: data.requestId
                    };
                    producer.send({
                        topic: "vouchers_listed",
                        messages: [{
                            key: "", value:  JSON.stringify(result)
                        }]
                    });

            }
        }
    });
    console.log("Connected to kafka waiting for messages");
};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await producer.disconnect();
            await consumer.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await submitOrder.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});
