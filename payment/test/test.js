'use strict';

// let config = require('../src/configuration');
const {Kafka, logLevel} = require('kafkajs');


const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'test_payment',
});

const submitOrder = kafka.consumer({groupId: 'payment_test'});
const producer = kafka.producer();
console.log("started test");
const run = async () => {
    console.log("test");
    await producer.connect();
    console.log("connected to kafka");
    await submitOrder.connect();
    await submitOrder.subscribe({topic: "payment_succeeded"});
    await submitOrder.subscribe({topic: "payment_failed"});
    var timeout;
    await submitOrder.run({
        eachMessage: async ({topic, partition, message}) => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log("response timed out");
                    process.exit(2);
                }, 10000);
            }
            console.log("Received", topic, JSON.stringify(message.value));
            if (topic === "payment_succeeded") {
                process.exit(0)
            } else {
                console.log("quitting");
                process.exit(1)
            }
        }
    });
    let message = {
        order: {id: "waowID123"},
        customer: {},
        creditCard: {
            name: "Bob",
            number: 551512348989,
            ccv: 775,
            limit: "07/19"
        }
    };
    console.log("starting send");
    await producer.send(
        {
            topic: "submit_order", messages: [{key: "", value: JSON.stringify(message)}]
        });
    await producer.send(
        {
            topic: "price_computed",
            messages: [{key: "", value: JSON.stringify({orderId: message.order.id, price: 20})}]
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
