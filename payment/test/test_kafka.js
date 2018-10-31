'use strict';

let config = require('../src/configuration');
const {Kafka, logLevel} = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: [config.KAFKA_URL],
    connectionTimeout: 3000,
    clientId: 'delivery_man_account',
});

const submitOrder = kafka.consumer({groupId: 'payment_test'});
const producer = kafka.producer();
console.log("started test");
const run = async () => {
    await producer.connect();
    await submitOrder.connect();
    await submitOrder.subscribe({topic: "payment_succeeded"});
    await submitOrder.subscribe({topic: "payment_failed"});
    await submitOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("Waow received", topic, message);
            if (topic === "payment_succeeded") {
                process.exit(0)
            }
        }
    });
    let message = {
        orderId: "waowID123",
        customer: {},
        creditCard: {
            name: "Bob",
            number: 551512348989,
            ccv: 775,
            limit: "07/19"
        }
    };
    await producer.send(
        {
            topic: "payment_succeeded", messages: [{key: "", value: message}]
        })
};

run().catch(e => console.error(`[payment_test/consumer] ${e.message}`, e));

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
