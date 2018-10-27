const express = require('express');
const bodyParser = require("body-parser");
const util = require('util');
const app = express();
const port = 3000;
const {Kafka, logLevel} = require('kafkajs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const Queue = require('queue-fifo');
const queue = new Queue();
const geoloQueue = new Queue();

const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'customerws',
});


const consumer = kafka.consumer({groupId: 'customer_consumer'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "meals_listed"});
    await consumer.subscribe({topic: "eta_result"});
    await consumer.subscribe({topic: "order_tracker"});
    //await consumer.subscribe({topic: "get_coursier_geoloc"}); <- ????
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("receive :"+ message.value.toString());
            switch (topic){
                case "order_tracker":
                    if (!geoloQueue.isEmpty()) {
                        geoloQueue.dequeue()(message);
                    } else {
                        console.log("Unable to process "+ topic +" response: " + message.value)
                    }
                    break;
                default:
                    console.log("eachMessage " + topic + " " + message);
                    if (!queue.isEmpty()) {
                        queue.dequeue()(message);
                    } else {
                        console.log("Unable to process "+ topic +" response: " + message.value)
                    }
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
            await listResponse.disconnect();
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
        } finally {
            process.kill(process.pid, type)
        }
    })
});

app.get('/meals/', (req, res) => {
    console.log("Received : " + util.inspect(req.query));
    if (!("categories" in req.query)) {
        res.send("Attribute 'categories' needed");
        return;
    }
    const categories = req.query.categories;
    if (!("restaurants" in req.query)) {
        res.send("Attribute 'restaurants' needed");
        return;
    }
    const restaurants = req.query.restaurants;
    console.log("Parsed : categories=" + categories + ", restaurants=" + restaurants);

    let value = JSON.stringify({
        categories: categories,
        restaurants: restaurants
    });
    console.log("Send list_meals : " + util.inspect(value));
    producer.send({
        topic: "list_meals",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});

app.post('/orders/', (req, res) => {
    res.send(util.inspect(req.body));
    if (!("meals" in req.body)) {
        res.send("Attribute 'meals' needed");
        return;
    }
    const meals = req.body.meals;
    if (!("customer" in req.body)) {
        res.send("Attribute 'customer' needed");
        return;
    }
    const customer = req.body.customer;

    let value = JSON.stringify({
        meals: meals,
        customer: customer
    });
    console.log("Send create_order_request " + util.inspect(value));
    producer.send({
        topic: "create_order_request",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});


app.put('/orders/', (req, res) => {
    if (!("order" in req.body)) {
        res.send("Attribute 'order' needed");
        return;
    }
    const orderContent = req.body.order.order;
    if (!("creditCard" in req.body)) {
        res.send("Attribute 'creditCard' needed");
        return;
    }
    const creditCard = req.body.order.creditCard;
    let value = "";
    if (creditCard != null) {
        value = JSON.stringify({
            order: orderContent,
            creditCard: creditCard
        });
    } else {
        value = JSON.stringify({
            order: orderContent
        });
    }
    console.log("Send submit_order " + util.inspect(value));
    producer.send({
        topic: "submit_order",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});

app.post('/feedbacks/', (req, res) => {
    res.send(util.inspect(req.body));
    if (!("mealId" in req.body)) {
        res.send("Attribute 'mealId' needed");
        return;
    }
    const mealId = req.body.mealId;
    if (!("customerId" in req.body)) {
        res.send("Attribute 'customerId' needed");
        return;
    }
    const customerId = req.body.customerId;
    if (!("rating" in req.body)) {
        res.send("Attribute 'rating' needed");
        return;
    }
    const rating = req.body.rating;
    if (!("description" in req.body)) {
        res.send("Attribute 'description' needed");
        return;
    }
    const description = req.body.description;
    let value = JSON.stringify({
        mealId: mealId,
        rating: rating,
        customerId: customerId,
        desc: description
    });
    console.log("Send add_feeback " + util.inspect(value));
    producer.send({
        topic: "add_feeback",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});

app.get('/geolocation/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    console.log("Parsed : orderId=" + orderId);
    let value = JSON.stringify({
        orderId: orderId
    });
    console.log("Send get_coursier_geoloc : " + util.inspect(value));
    producer.send({
        topic: "get_coursier_geoloc",
        messages: [{
            key: "", value: value
        }]
    });
    geoloQueue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});


app.listen(port, () => console.log(`Gateway Customer listening on port ${port}!`));