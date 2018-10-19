'use strict';

const {Kafka, logLevel} = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["localhost:9092"],
    connectionTimeout: 3000,
    clientId: 'coursier',
});

const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await producer.send({topic: "order_delivered", messages: [{key: "delivered", value: {saucisse: "WAOW"}}]})
};

run().catch(e => console.error(`[test/producer] ${e.message}`, e));