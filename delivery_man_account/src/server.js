'use strict';

let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper, (db) => {

    let accounts = [
        {
            name: "Jamie",
            coursierId: '18',
            credits: 0
        },
        {
            name: "Fred",
            coursierId: '19',
            credits: 0
        }
    ];
    console.log("seeding with", accounts);
    db.collection("accounts").insertMany(accounts)
});


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'delivery_man_account',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});
const consumer = kafka.consumer({groupId: 'delivery_man_account'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "order_delivered"});
    await consumer.subscribe({topic: "get_coursier_credits"});
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            let data = JSON.parse(message.value.toString());
            console.log("received", topic, data);
            switch (topic) {
                case "order_delivered":
                    methods.orderDelivered(data, mongoHelper.db);
                    break;
                case "get_coursier_credits":
                    await methods.getCredits(data, mongoHelper.db, producer);
                    break;

            }
        }
    });
};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
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
            await consumer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});
