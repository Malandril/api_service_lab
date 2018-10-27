/**
 * Created by Hasaghi on 27/10/2018.
 */

const util = require('util');
let http = require('http');
let url = require('url');
const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'order-test',
});

const producer = kafka.producer();
const consumer = kafka.consumer({groupId:"order_consumer_test"});
const consumers = ["create_order","finalise_order"];
const run = async () => {
    await producer.connect();
    consumer.connect();
    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });

    consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("[" + topic+ "] "+ util.inspect(JSON.parse(message.value.toString())));
        }
    });
};


run().catch(e => console.error(`[order] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await producer.disconnect();
            await consumers.forEach(function (c) {
                consumer.disconnect();
            });
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
            await consumers.forEach(function (c) {
                consumer.disconnect();
            });
        } finally {
            process.kill(process.pid, type)
        }
    })
});
