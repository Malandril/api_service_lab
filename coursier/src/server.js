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
    clientId: 'coursier',
});

const consumer = kafka.consumer({ groupId: 'coursier_consumer' });
const producer = kafka.producer();
const consumers = ["order_delivered","finalise_order","get_ordered_to_be_delivered","update_geoloc","get_coursier_geoloc",
    "assign_delivery", "cancel_delivery"];
const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });

    consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log(topic,data);
            switch (topic){
                case "get_ordered_to_be_delivered":
                    methods.getOrderedToBeDelivered(data,producer,mongoHelper.db);
                    break;
                case "finalise_order":
                    methods.addOrder(data, mongoHelper.db);
                    break;
                case "assign_delivery":
                    methods.assign(data, mongoHelper.db);
                    break;
                case "cancel_delivery":
                    methods.disassign(data, mongoHelper.db);
                    break;
                case "order_delivered":
                    methods.deleteOrder(data, mongoHelper.db);
                    break;
                case "update_geoloc":
                    methods.updateLocalisation(data, mongoHelper.db);
                    break;
                case "get_coursier_geoloc":
                    methods.getLocalisation(data, mongoHelper.db, producer);
                    break;
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
