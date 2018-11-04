'use strict';

// let config = require('../src/configuration');
const {Kafka, logLevel} = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'test_catalog',
});

const consumer = kafka.consumer({groupId: 'catalog_test'});
const producer = kafka.producer();
console.log("started test");
const run = async () => {
    console.log("test");
    await producer.connect();
    console.log("connected to kafka");
    await consumer.connect();
    await consumer.subscribe({topic: "meals_listed"});
    var timeout;
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log("response timed out");
                    process.exit(2);
                }, 10000);
            }
            console.log("Received", topic, JSON.stringify(message.value));
            switch (topic) {
                case "meals_listed":
                    console.log(message.value);
                    break;
            }
        }
    });
    console.log("starting send");
    await producer.send(
        {
            topic: "list_meals",
            messages: [{key: "", value: JSON.stringify({category: "burger"})}]
        });
    timeout = setTimeout(() => {
        console.log("response timed out");
        process.exit(2);
    }, 10000);
    console.log("Message sent");
};

run().catch(e => console.error(`[catalog_test/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await consumer.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        process.exit(1)
    })
});
