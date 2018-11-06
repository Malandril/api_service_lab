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
    clientId: 'pricer',
});
const consumer = kafka.consumer({groupId: 'pricer'});
const producer = kafka.producer();
const consumers = ["create_order", "add_voucher", "list_vouchers"];
const run = async () => {
    await producer.connect();
    await consumer.connect();

    await consumers.forEach(function (c) {
        consumer.subscribe({topic: c});
    });
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            var data = JSON.parse(message.value.toString());
            console.log("Received from topic:", topic, data);
            switch (topic) {
                case "create_order_request":
                    methods.createOrder(data, mongoHelper.db, producer);
                    break;
                case "add_voucher":
                    methods.addVoucher(data, mongoHelper.db);
                    break;
                case "list_vouchers":
                    methods.listVouchers(data, mongoHelper.db, producer);
                    break;
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
            await producer.disconnect();
            await consumer.disconnect();
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
