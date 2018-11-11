'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper, (db) => {
    db.collection("meals").countDocuments().then((count) => {
        if (count === 0) {
            // Seed the database
            console.log("Seeding database");
            db.collection("meals").insertMany(
                [
                    {
                        id: "42",
                        name: "Mac first",
                        category: "burger",
                        type: "burger",
                        eta: 4,
                        price: 1.0,
                        feedbacks: [
                            {
                                rating: 4,
                                customerId: "15",
                                desc: "Awesome"

                            }
                        ],
                        restaurant: {
                            id: "12",
                            name: "MacDo",
                            address: "4 Privet Drive"
                        }
                    },
                    {
                        id: "51",
                        name: "Big Mac",
                        category: "burger",
                        type: "burger",
                        eta: 4,
                        price: 1.0,
                        feedbacks: [
                            {
                                rating: 4,
                                customerId: "15",
                                desc: "Nice"

                            }
                        ],
                        restaurant: {
                            id: "12",
                            name: "MacDo",
                            address: "4 Privet Drive"
                        }
                    },
                    {
                        id: "98",
                        name: "McFlurry",
                        category: "burger",
                        type: "dessert",
                        eta: 4,
                        price: 1.0,
                        feedbacks: [
                        ],
                        restaurant: {
                            id: "12",
                            name: "MacDo",
                            address: "4 Privet Drive"
                        }
                    },
                    {
                        id: "69",
                        name: "Whopper",
                        category: "burger",
                        eta: 4,
                        type: "burger",
                        price: 1.0,
                        feedbacks: [],
                        restaurant: {
                            id: "25",
                            name: "BurgerKing",
                            address: "7 Privet Drive"
                        }
                    }
                ]
            )
        }
    });
});


const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'catalog',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});
const consumer = kafka.consumer({groupId: 'catalog'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();

    await consumer.connect();
    await consumer.subscribe({topic: "list_meals"});
    await consumer.subscribe({topic: "add_feedback"});
    await consumer.subscribe({topic: "list_feedback"});

    await consumer.connect();

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            let data = JSON.parse(message.value.toString());
            console.log("Topic ", topic, "Event ", data);
            switch (topic) {
                case "list_meals":
                    methods.listMeals(data, producer, mongoHelper.db);
                    break;
                case "add_feedback":
                    methods.addFeedback(data, mongoHelper.db);
                    break;
                case "list_feedback":
                    methods.listFeedback(data, producer, mongoHelper.db);
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
            process.exit(1)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await consumer.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});