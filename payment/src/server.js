'use strict';

let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["127.0.0.1:9092"],
    connectionTimeout: 3000,
    clientId: 'delivery_man_account',
});
const submitOrder = kafka.consumer({groupId: 'submit_order'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await submitOrder.connect();
    await submitOrder.subscribe({topic: "submit_order"});
    await submitOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            methods.submitOrder(message.value.toString(), mongoHelper.db, producer);
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
            await submitOrder.disconnect();
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
