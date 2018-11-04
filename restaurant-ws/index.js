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

const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'restaurantws',
});


const consumer = kafka.consumer({groupId: 'restaurant_consumer'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "todo_meals"});
    await consumer.subscribe({topic: "order_delivered"});
    await consumer.subscribe({topic: "statistics"});
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            if (!queue.isEmpty()) {
                queue.dequeue()(message);
            } else {
                console.log("Unable to process "+topic+" response: " + message.value)
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
            await listResponse.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});

app.get('/orders/', (req, res) => {
    console.log("Received : " + util.inspect(req.query));
    if (!("id" in req.query)) {
        res.send("Attribute 'id' needed");
        return;
    }
    const restaurantId = req.query.id;
    console.log("Parsed : id=" + restaurantId);

    let value = JSON.stringify({
        restaurantId : restaurantId
    });
    console.log("Send get_todo_meals : " + util.inspect(value));
    producer.send({
        topic: "get_todo_meals",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })


});

app.put('/orders/:orderId', (req, res) => {
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.params.orderId;
    let value = JSON.stringify({order: {
            id: orderId
        }
    });
    console.log("Send meal_cooked : " + util.inspect(value));
    producer.send({
        topic: "meal_cooked",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});

app.get('/statistics/', (req, res) => {
    if (!("restaurantId" in req.body)) {
        res.send("Attribute 'restaurantId' needed");
        return;
    }
    const restaurantId = req.body.restaurantId;
    let value = JSON.stringify({
        restaurantId: restaurantId
    });
    console.log("Send get_statistics : " + util.inspect(value));
    producer.send({
        topic: "get_statistics",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});

app.get('/feedbacks/', (req, res) => {
    if (!("restaurantId" in req.body)) {
        res.send("Attribute 'restaurantId' needed");
        return;
    }
    const restaurantId = req.body.restaurantId;
    let value = JSON.stringify({
        restaurantId: restaurantId
    });
    console.log("Send list_feedback : " + util.inspect(value));
    producer.send({
        topic: "list_feedback",
        messages: [{
            key: "", value: value
        }]
    });
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })
});



app.listen(port, () => console.log(`Restaurant Gateway app listening on port ${port}!`));