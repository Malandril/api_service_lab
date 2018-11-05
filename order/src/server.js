'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const { Kafka, logLevel } = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'order',
});

const producer = kafka.producer();
const consumer = kafka.consumer({groupId:"order_consume"});
const consumers = ["submit_order", "order_delivered", "payment_failed", "payment_succeeded", "payment_not_needed", "create_order_request", "assign_delivery", "meal_cooked"];
const TOPICS = ["create_order", "finalise_order"];

const run = async () => {
    await producer.connect();
    consumer.connect();
    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });

    consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log("Read :" + topic + util.inspect(data));

            switch(topic){
                case "create_order_request":
                    methods.createOrder(data,mongoHelper.db, producer);
                    break;
                case "submit_order":
                    methods.submitOrder(data, mongoHelper, producer);
                    break;
                case "payment_succeeded":
                    methods.processPaymentResult(true, data, mongoHelper, producer);
                    break;
                case "payment_failed":
                    methods.processPaymentResult(false, data, mongoHelper, producer);
                    break;
                case "payment_not_needed":
                    //do nothing
                    break;
                case "assign_delivery":
                    methods.logDeliveyAssignation(data,mongoHelper, producer);
                    break;
                case "meal_cooked":
                    methods.logMealCooked(data,mongoHelper);
                    break;
                case "order_delivered":
                    methods.validateFinishOrder(data, mongoHelper);
                    break;
                default:
                    console.log("Unimplemented topic :" + topic);
                    break;
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
