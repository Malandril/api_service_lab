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
    clientId: 'coursier',
});

const getDeliverableOrders = kafka.consumer({ groupId: 'get_ordered_to_be_delivered' });
const finaliseOrder = kafka.consumer({ groupId: 'finalise_order' });
const deleteOrder = kafka.consumer({ groupId: 'order_delivered' });
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await getDeliverableOrders.connect();
    await getDeliverableOrders.subscribe({topic:"get_ordered_to_be_delivered"});

    await deleteOrder.connect();
    await deleteOrder.subscribe({topic:"order_delivered"});
    await deleteOrder.run({
        eachMessage: async ({ topic, partition, message }) => {
            methods.deleteOrder(message.value.toString(),mongoHelper.db);
        }
    });

    await finaliseOrder.connect();
    await finaliseOrder.subscribe({topic:"finalise_order"});
    await getDeliverableOrders.run({
        eachMessage: async ({ topic, partition, message }) => {
            methods.getOrderedToBeDelivered(message.value.toString(),producer,mongoHelper.db);
        }
    });

    await finaliseOrder.run({
        eachMessage: async({topic, partition, message}) => {
            console.log(util.inspect(message.value.toString(), {showHidden: false, depth: null}));
            console.log((util.inspect(mongoHelper)));
            methods.addOrder(message.value.toString(),mongoHelper.db);
        }
    })


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
