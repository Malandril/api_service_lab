'use strict';

let methods = require('./methods');
const { Kafka, logLevel } = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'delivery_man_account',
});
const orderDelivered = kafka.consumer({ groupId: 'order_delivered' });

const run = async () => {
    await orderDelivered.connect();
    await orderDelivered.subscribe({topic:"order_delivered"});
    await orderDelivered.run({
        eachMessage: async ({ topic, partition, message }) => {
            methods.orderDelivered(message.value.toString(),mongoHelper.db);
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
            await orderDelivered.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await orderDelivered.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});
