const express = require('express');
const bodyParser = require("body-parser");
const util = require('util');
const app = express();
const port = 3000;
const {Kafka, logLevel} = require('kafkajs');
const uuidv4 = require('uuid/v4');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const kafka = new Kafka({
    logLevel: logLevel.ERROR,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'coursierws',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});


const consumer = kafka.consumer({groupId: 'coursier_ws'});
const producer = kafka.producer();

const openConnections = new Map();
const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "list_orders_to_be_delivered"});
    await consumer.subscribe({topic: "coursier_credits"});

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const data = JSON.parse(message.value.toString());
            console.log("Receive : " + message.value.toString() + topic + data + data.requestId + openConnections.get(data.requestId));
            if (openConnections.get(data.requestId).checkValidity(data)) {
                openConnections.delete(data.requestId);
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
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});


app.get('/coursiers/:id/credits', (req, res) => {
    console.log("Received : " + util.inspect(req.query));
    if (!("id" in req.params)) {
        res.send("Attribute 'id' needed");
        return;
    }
    const coursierId = req.params.id;

    console.log("Parsed : id=" + coursierId);

    const uuid = uuidv4();
    let value = JSON.stringify({
        requestId: uuid,
        coursierId: coursierId
    });
    console.log("Sent : " + util.inspect(value));
    producer.send({
        topic: "get_coursier_credits",
        messages: [{
            key: "", value: value
        }]
    });
    openConnections.set(uuid, {
        res: res,
        checkValidity: function (data) {
            delete data.requestId;
            res.send(data);
            return true;
        }
    });

    console.log("put " + uuid + " in openConnection");

});

app.get('/deliveries/', (req, res) => {
    console.log("Received : " + util.inspect(req.query));
    if (!("id" in req.query)) {
        res.send("Attribute 'id' needed");
        return;
    }
    const coursierId = req.query.id;
    if (!("address" in req.query)) {
        res.send("Attribute 'address' needed");
        return;
    }
    const address = req.query.address;
    console.log("Parsed : id=" + coursierId + ", address= " + address);

    const uuid = uuidv4();
    let value = JSON.stringify({
        requestId: uuid,
        coursier: {
            id: coursierId,
            address: address
        }
    });
    console.log("Send : " + util.inspect(value));
    producer.send({
        topic: "get_ordered_to_be_delivered",
        messages: [{
            key: "", value: value
        }]
    });
    console.log("put " + uuid + " in openConnection");

    openConnections.set(uuid, {
        res: res,
        checkValidity: function (data) {
            delete data.requestId;
            console.log("waow getting deliveries");
            res.send(data);
            return true;
        }
    })

});

app.post('/deliveries/', async (req, res) => {
    res.send(util.inspect(req.body));
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.body.orderId;
    if (!("coursierId" in req.body)) {
        res.send("Attribute 'coursierId' needed");
        return;
    }
    const coursierId = req.body.orderId;

    let value = JSON.stringify({
        coursierId: coursierId,
        orderId: orderId
    });
    console.log("Send : assign_delivery " + util.inspect(value));
    await producer.send({
        topic: "assign_delivery",
        messages: [{
            key: "", value: value
        }]
    });
    // res.sendStatus(201)
});


app.put('/deliveries/:orderId', async (req, res) => {
    if (!("orderId" in req.params)) {
        res.status(400).send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.params.orderId;
    if (!("coursierId" in req.body)) {
        res.status(400).send("Attribute 'coursierId' needed");
        return;
    }
    const coursierId = req.body.coursierId;
    let value = JSON.stringify({
        order: {
            id: orderId
        },
        coursierId: coursierId
    });
    console.log("Send : order_delivered " + util.inspect(value));
    await producer.send({
        topic: "order_delivered",
        messages: [{
            key: "", value: value
        }]
    });
    res.sendStatus(200);
});

app.put('/geolocation/', async (req, res) => {
    if (!("timestamp" in req.body)) {
        res.send("Attribute 'timestamp' needed");
        return;
    }
    const timestamp = req.body.timestamp;
    if (!("coursierId" in req.body)) {
        res.send("Attribute 'coursierId' needed");
        return;
    }
    const coursierId = req.body.coursierId;
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.body.orderId;
    if (!("geolocation" in req.body)) {
        res.send("Attribute 'geolocation' needed");
        return;
    }
    const geolocation = req.body.geolocation;
    let value = JSON.stringify({
        timestamp: timestamp,
        orderId: orderId,
        coursierId: coursierId,
        geoloc: geolocation
    });
    console.log("Send : update_geoloc " + util.inspect(value));
    await producer.send({
        topic: "update_geoloc",
        messages: [{
            key: "", value: value
        }]
    });
    res.send("ok");

});


app.delete('/deliveries/:orderId', async (req, res) => {
    console.log(req.params);
    console.log(req.body);
    console.log(req.query);
    if (!("orderId" in req.params) && !("orderId" in req.body)) {
        res.status(400).send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.params.orderId || req.body.orderId;
    if (!("coursierId" in req.body)) {
        res.status(400).send("Attribute 'coursierId' needed");
        return;
    }
    const coursierId = req.body.coursierId;
    let value = JSON.stringify({
        orderId: orderId,
        coursierId: coursierId
    });
    console.log("Send : cancel_delivery " + util.inspect(value));
    await producer.send({
        topic: "cancel_delivery",
        messages: [{
            key: "", value: value
        }]
    });
    res.sendStatus(200);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));