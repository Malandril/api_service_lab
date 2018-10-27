'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const { Kafka, logLevel } = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'order',
});

const producer = kafka.producer();
const consumer = kafka.consumer({groupId:"order_consumer"});
const consumers = ["submit_order", "payment_failed", "payment_succeeded", "payment_not_needed", "create_order_request", "assign_delivery", "meal_cooked", "order_delivered"];
const TOPICS = ["create_order", "finalise_order"];

const run = async () => {
    await producer.connect();
    consumer.connect();
    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });

    consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("Read :" + topic + util.inspect(message.value.toString()));
            switch(topic){
                case "create_order_request":
                    methods.createOrder(message.value.toString(),mongoHelper.db, producer);
                    break;
                case "submit_order":
                    methods.submitOrder(message.value.toString(), mongoHelper.db, producer);
                    break;
                default:
                    console.log("Unimplemented topic :" + topic);
            }
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
