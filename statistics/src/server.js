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
    clientId: 'statistics',
});

const consumer = kafka.consumer({ groupId: 'statistics_consumer' });
const producer = kafka.producer();
const consumers = ["meal_cooked","order_delivered","assign_delivery","finalise_order","get_statistics"];
const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });

    consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log(data);
            switch (topic){
                case "meal_cooked":
                    methods.putNewStatus(data,mongoHelper.db, "meal_cooked");
                    break;
                case "order_delivered":
                    methods.putNewStatus(data,mongoHelper.db, "order_delivered");
                    break;
                case "assign_delivery":
                    methods.putNewStatus(data,mongoHelper.db, "assign_delivery");
                    break;
                case "finalise_order":
                    methods.putNewStatus(data,mongoHelper.db, "finalise_order");
                    break;
                case "get_statistics":
                    methods.createStatistics(data, mongoHelper.db, producer);
            }
        }}
    );
};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await getDeliverableOrders.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await getDeliverableOrders.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});
