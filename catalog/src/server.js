'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const {Kafka, logLevel} = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper, (db) => {
    console.log("in function");
    db.collection("meals").countDocuments().then((count) => {
        if(count === 0) {
            // Seed the database
            console.log("Seeding database");
            db.collection("meals").insertMany(
                    [
                        {
                            id: "42",
                            name: "Mac first",
                            category: "burger",
                            eta: 4,
                            price: 1.0,
                            feedback: [
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
                            eta: 4,
                            price: 1.0,
                            feedback: [
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
                            id: "69",
                            name: "Whopper",
                            category: "burger",
                            eta: 4,
                            price: 1.0,
                            feedback: [],
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
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'catalog',
});
const consummer = kafka.consumer({groupId: 'catalog'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();

    await consummer.connect();
    await consummer.subscribe({topic: "list_meals"});
    await consummer.subscribe({topic: "add_feedback"});
    await consummer.subscribe({topic: "list_feedback"});

    await consumer.connect();

    await consummer.run({
        eachMessage: async ({topic, partition, message}) => {
            switch (topic) {
                case "list_meals":
                    methods.listMeals(JSON.parse(message.value), producer, mongoHelper.db);
                    break;
                case "add_feedback":
                    methods.addFeedback(JSON.parse(message.value), producer, mongoHelper.db);
                    break;
                case "list_feedback":
                    methods.listFeedback(JSON.parse(message.value), mongoHelper.db);
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
            await consumer.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});