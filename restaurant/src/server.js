'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'restaurant',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});
const consumer = kafka.consumer({groupId: 'restaurant'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();

    await consumer.connect();
    await consumer.subscribe({topic: "finalise_order"});
    await consumer.subscribe({topic: "get_meals"});
    await consumer.subscribe({topic: "order_delivered"});
    await consumer.subscribe({topic: "meal_cooked"});
    await consumer.subscribe({topic: "cancel_delivery"});


    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("Received", topic, message.value.toString());
            switch (topic) {
                case "finalise_order":
                    methods.finaliseOrder(message.value.toString(), mongoHelper.db);
                    break;
                case "get_meals":
                    methods.getMeals(message.value.toString(), producer, mongoHelper.db);
                    break;
                case "order_delivered":
                    methods.orderDelivered(message.value.toString(), mongoHelper.db);
                    break;
                case "meal_cooked":
                    methods.mealCooked(message.value.toString(), mongoHelper.db);
                    break;
                case "cancel_delivery":
                    methods.orderCanceled(message.value.toString(), mongoHelper.db);
                    break;
            }
        }
    });

};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await producer.disconnect();
            process.exit(1)
        } finally {
            process.kill(process.pid, type)
        }
    })
});
