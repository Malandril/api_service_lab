'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'restaurant',
});
const finaliseOrder = kafka.consumer({groupId: 'finalise_order'});
const getMeals = kafka.consumer({groupId: 'get_meals'});
const orderDelivered = kafka.consumer({groupId: 'order_delivered'});
const mealCooked = kafka.consumer({groupId: 'meal_cooked'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();

    await finaliseOrder.connect();
    await finaliseOrder.subscribe({topic: "finalise_order"});
    await finaliseOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            methods.finaliseOrder(message.value.toString(), mongoHelper.db);
        }
    });

    await getMeals.connect();
    await getMeals.subscribe({topic: "get_meals"});
    await getMeals.run({
        eachMessage: async ({topic, partition, message}) => {
            methods.getMeals(message.value.toString(), producer, mongoHelper.db);
        }
    });

    await orderDelivered.connect();
    await orderDelivered.subscribe({topic: "order_delivered"});
    await orderDelivered.run({
        eachMessage: async ({topic, partition, message}) => {
            methods.orderDelivered(message.value.toString(), mongoHelper.db);
        }
    });

    await mealCooked.connect();
    await mealCooked.subscribe({topic: "meal_cooked"});
    await mealCooked.run({
        eachMessage: async ({topic, partition, message}) => {
            methods.mealCooked(message.value.toString(), mongoHelper.db);
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
            await finaliseOrder.disconnect();
            await getMeals.disconnect();
            await orderDelivered.disconnect();
            await mealCooked.disconnect();
            await producer.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await finaliseOrder.disconnect();
            await getMeals.disconnect();
            await orderDelivered.disconnect();
            await mealCooked.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});