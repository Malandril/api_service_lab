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
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'coursierws',
});


const listResponse = kafka.consumer({groupId: 'list_orders_to_be_delivered'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await listResponse.connect();
    await listResponse.subscribe({topic: "list_orders_to_be_delivered"});

    await listResponse.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("eachMessage " + topic + " " + message);
            if (!queue.isEmpty()) {
                queue.dequeue()(message);
            } else {
                console.log("Unable to process list_orders_to_be_delivered response: " + message.value)
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

    let value = JSON.stringify({
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
    queue.enqueue(function (msg) {
        console.log("unqueue : " + msg.value);
        res.send(msg.value.toString());
    })


});

app.post('/deliveries/', (req, res) => {
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
    producer.send({
        topic: "assign_delivery",
        messages: [{
            key: "", value: value
        }]
    });

});


app.put('/deliveries/', (req, res) => {
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.body.orderId;
    let value = JSON.stringify({order: {
        id: orderId
        }
    });
    console.log("Send : order_delivered " + util.inspect(value));
    producer.send({
        topic: "order_delivered",
        messages: [{
            key: "", value: value
        }]
    });

});

app.put('/geolocation/', (req, res) => {
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
    if (!("geolocation" in req.body)) {
        res.send("Attribute 'geolocation' needed");
        return;
    }
    const geolocation = req.body.geolocation;
    let value = JSON.stringify({
        timestamp: timestamp,
        coursierId: coursierId,
        geoloc: geolocation
    });
    console.log("Send : update_geoloc " + util.inspect(value));
    producer.send({
        topic: "update_geoloc",
        messages: [{
            key: "", value: value
        }]
    });

});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));