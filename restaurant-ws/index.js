const express = require('express');
const bodyParser = require("body-parser");
const util = require('util');
const app = express();
const port = 3000;
const {Kafka, logLevel} = require('kafkajs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const uuidv4 = require('uuid/v4');


const Queue = require('queue-fifo');
const queue = new Queue();

const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'restaurantws',
});

const openConnections = new Map();
const consumer = kafka.consumer({groupId: 'restaurant_consumer'});
const producer = kafka.producer();
function checkArgs(argName, request, errors) {
    if (!(argName in request)) {
        errors.push("Attribute '" + argName + "' needed");
        return null;
    } else {

        return request[argName];
    }
}
const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "todo_meals"});
    // await consumer.subscribe({topic: "order_delivered"});
    await consumer.subscribe({topic: "statistics"});
    await consumer.subscribe({topic: "feedback_listed"});
    await consumer.subscribe({topic: "vouchers_listed"});

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const data = JSON.parse(message.value.toString());
            console.log(topic,data);
            if ("requestId" in data) {
                const el = openConnections.get(data.requestId);
                console.log("Get connection " + data.requestId + " : " + el);
                if (el(topic, data)) {
                    openConnections.delete(data.requestId);
                }
            } else {

                if (!queue.isEmpty()) {
                    queue.dequeue()(message);
                } else {
                    console.log("Unable to process " + topic + " response: " + message.value)
                }
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
            await producer.disconnect();
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

app.get('/orders/', (req, res) => {
    console.log("Received : " + util.inspect(req.query));
    if (!("id" in req.query)) {
        res.send("Attribute 'id' needed");
        return;
    }
    const restaurantId = req.query.id;
    const requestId = uuidv4();
    console.log("Parsed : id=" + restaurantId);

    let value = JSON.stringify({
        restaurantId: restaurantId,
        requestId: requestId
    });
    console.log("Send get_todo_meals : " + util.inspect(value));
    openConnections.set(requestId, function (topic, msg) {
        res.send(msg);
        return true;
    });
    producer.send({
        topic: "get_todo_meals",
        messages: [{
            key: "", value: value
        }]
    });

});

app.put('/orders/:orderId', (req, res) => {
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.params.orderId;
    let value = JSON.stringify({
        order: {
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
    res.send("Ok");
});

app.get('/statistics/:restaurantId', (req, res) => {
    if (!("restaurantId" in req.query)) {
        res.send("Attribute 'restaurantId' needed");
        return;
    }
    const requestId = uuidv4();

    const restaurantId = req.query.restaurantId;
    let value = JSON.stringify({
        requestId:requestId,
        restaurantId: restaurantId
    });
    console.log("Send get_statistics : " + util.inspect(value));

    openConnections.set(requestId, function (topic, msg) {
        res.send(msg);
        return true;
    });
    producer.send({
        topic: "get_statistics",
        messages: [{
            key: "", value: value
        }]
    });
});

app.get('/feedbacks/:restaurantId', (req, res) => {
    if (!("restaurantId" in req.params)) {
        res.send("Attribute 'restaurantId' needed");
        return;
    }
    const restaurantId = req.params.restaurantId;
    const requestId = uuidv4();

    let value = JSON.stringify({
        restaurantId: restaurantId,
        requestId: requestId
    });
    console.log("Send list_feedback : " + util.inspect(value));

    openConnections.set(requestId, function (topic, msg) {
        res.send(msg);
        return true;
    });
    producer.send({
        topic: "list_feedback",
        messages: [{
            key: "", value: value
        }]
    });

});


app.post('/vouchers/', (req, res) => {

    var errors = [];
    const restaurantId = checkArgs("restaurantId", req.body, errors);
    const code = checkArgs("code", req.body, errors);
    const discount = checkArgs("discount", req.body, errors);
    const expirationDate = checkArgs("expirationDate", req.body, errors);
    if (errors.length !== 0) {
        res.statusCode = 412;
        res.send(errors.toString());
        return;
    }
    let value = JSON.stringify({
        restaurantId: restaurantId,
        code: code,
        discount: discount,
        expirationDate: expirationDate
    });
    producer.send({
        topic: "add_voucher",
        messages: [{
            key: "", value: value
        }]
    });
    res.send("ok");
});
app.get('/vouchers/', (req, res) => {
    var errors = [];
    const restaurantId = checkArgs("restaurantId", req.body, errors);
    if (errors.length !== 0) {
        res.statusCode = 412;
        res.send(errors.toString());
        return;
    }
    const uuid = uuidv4();

    let value = JSON.stringify({
        restaurantId: restaurantId,
        requestId: uuid
    });
    openConnections.set(uuid, function (topic, msg) {
        res.send(msg);
        return true;
    });
    producer.send({
        topic: "list_vouchers",
        messages: [{
            key: "", value: value
        }]
    });

});


app.listen(port, () => console.log(`Restaurant Gateway app listening on port ${port}!`));