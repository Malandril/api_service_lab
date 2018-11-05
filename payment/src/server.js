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
    clientId: 'payment',
});
const submitOrder = kafka.consumer({groupId: 'payment'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await submitOrder.connect();
    await submitOrder.subscribe({topic: "submit_order"});
    await submitOrder.subscribe({topic: "price_computed"});
    await submitOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log("Received from topic:", topic, data);
            switch (topic) {
                case "submit_order":
                    methods.submitOrder(data, mongoHelper.db, producer);
                    break;
                case "price_computed":
                    methods.priceComputed(data, mongoHelper.db);

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
