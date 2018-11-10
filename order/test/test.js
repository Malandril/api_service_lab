'use strict';

// let config = require('../src/configuration');
const {Kafka, logLevel} = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'test_order',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});

const submitOrder = kafka.consumer({groupId: 'order_test'});
const producer = kafka.producer();

const Queue = require('queue-fifo');
const queue = new Queue();

console.log("started test");
const run = async () => {
    console.log("test");
    await producer.connect();
    console.log("connected to kafka");
    await submitOrder.connect();
    await submitOrder.subscribe({topic: "create_order"});
    await submitOrder.subscribe({topic: "finalise_order"});
    var timeout;
    await submitOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            queue.enqueue({topic : topic, msg: message});
            if (timeout) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log("response timed out");
                    process.exit(2);
                }, 10000);
            }
            console.log("Received", topic, JSON.stringify(message.value));

        }
    });


    let message = {
        order: {
            id:"12345"
        },
        timestamp: Math.round(new Date().getTime() / 1000)
    };
    console.log("starting send");
    await producer.send(
        {
            topic: "price_computed",
            messages: [{key: "", value: JSON.stringify(message)}]
        });
    timeout = setTimeout(() => {
        console.log("response timed out");
        process.exit(2);
    }, 10000);
    console.log("Message sent");
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
        process.exit(1)
    })
});
