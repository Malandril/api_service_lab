const express = require('express');
const bodyParser = require("body-parser");
const util = require('util');
const app = express();
const port = 3000;
const uuidv4 = require('uuid/v4');
const {Kafka, logLevel} = require('kafkajs');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


const creationInstances = new Map(); //sticky sessions
const waitForOrderValidation = new Map();
const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: 'customerws',
    retry: {
        retries: 10,
        factor: 0,
        multiplier: 4
    }
});

function checkArgs(argName, request, errors) {
    if (!(argName in request)) {
        errors.push("Attribute '" + argName + "' needed");
        return null;
    } else {

        return request[argName];
    }
}


const consumer = kafka.consumer({groupId: 'customerwsconsumer'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: "meals_listed"});
    await consumer.subscribe({topic: "eta_result"});
    await consumer.subscribe({topic: "order_tracker"});
    await consumer.subscribe({topic: "finalise_order"});
    await consumer.subscribe({topic: "price_computed"});
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {

            var data = JSON.parse(message.value.toString());
            console.log("Topic ", topic, "Event ", data);

            switch (topic) {
                case "order_tracker":
                    const track = creationInstances.get(data.requestId);
                    if (track.checkFinish(topic, message, data)) {
                        creationInstances.delete(data.requestId);
                    }
                    break;
                case "price_computed":
                case "eta_result":
                case "meals_listed":
                    const element = creationInstances.get(data.requestId);
                    if (element.checkFinish(topic, message, data)) {
                        creationInstances.delete(data.requestId);
                    }
                    break;
                case "finalise_order":
                    var el = waitForOrderValidation.get(data.order.id);
                    if (el.checkFinish(topic, message, data)) {
                        waitForOrderValidation.delete(data.order.id);
                    }
                    break;
                default:
                    console.log("Unable to process " + topic + " response: " + message.value);
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

    var category = undefined;
    var restaurant = undefined;
    if ("category" in req.query || "restaurant" in req.query) {
        if ("category" in req.query) {
            category = req.query.category;
            if (!Array.isArray(category)) {
                category = [category]
            }
        }
        if ("restaurant" in req.query) {
            restaurant = req.query.restaurant;
            if (!Array.isArray(restaurant)) {
                restaurant = [restaurant]
            }
        }
    } else {
        res.send("Attribute 'category' or 'restaurant' needed", 400);
        return;
    }
    console.log("Parsed : category=" + category + ", category=" + restaurant);
    let requestId = uuidv4();
    let value = JSON.stringify({
        requestId: requestId,
        categories: category,
        restaurants: restaurant
    });
    creationInstances.set(requestId, {
        res: res,
        checkFinish: function (topic, message, data) {
            res.send(data);
            return true;
        }
    });
    producer.send({
        topic: "list_meals",
        messages: [{
            key: requestId, value: value
        }]
    });
});

app.post('/orders/', (req, res) => {
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
    let session = uuidv4();
    let value = JSON.stringify({
        requestId: session,
        meals: meals,
        customer: customer,
        voucher:req.body.voucher
    });

    creationInstances.set(session, {
        clientResp: res,
        eta: null,
        orderId: null,
        price: null,
        checkFinish: function (topic, message, data) {
            if (topic === "eta_result") {
                this.eta = data.eta;
            } else {
                this.orderId = data.orderId;
                this.price = data.price;
            }
            let b = this.eta !== null && this.orderId !== null;
            if (b) {
                this.clientResp.send(JSON.stringify({
                    orderId: this.orderId,
                    eta: this.eta,
                    price: this.price
                }));
            }
            return b;
        }
    });
    producer.send({
        topic: "create_order_request",
        messages: [{
            key: "", value: value
        }]
    });
});

app.put('/orders/:orderId', (req, res) => {
    const orderId = req.body.orderId;
    const meals = req.body.meals;
    const customer = req.body.customer;
    const creditCard = req.body.creditCard;
    let value = JSON.stringify({
        timestamp: Math.round((new Date()).getTime() / 1000),
        order: {
            id: orderId,
            meals: meals,
            customer: customer
        },
        creditCard: creditCard
    });
    console.log("Send submit_order " + util.inspect(value));
    waitForOrderValidation.set(orderId, {
        clientResp: res,
        checkFinish: function (topic, message, data) {
            this.clientResp.send("ok");
        }
    });
    producer.send({
        topic: "submit_order",
        messages: [{
            key: "", value: value
        }]
    });
});

app.post('/feedbacks/', async (req, res) => {
    if (!("mealId" in req.body)) {
        res.send("Attribute 'mealId' needed");
        return;
    }
    var errors = [];
    const mealId = checkArgs("mealId", req.body, errors);
    const customerId = checkArgs("customerId", req.body, errors);
    const rating = checkArgs("rating", req.body, errors);
    const desc = checkArgs("desc", req.body, errors);
    if (errors.length !== 0) {
        res.statusCode = 412;
        res.send(errors.toString());
        return;
    }
    let value = JSON.stringify({
        mealId: mealId,
        rating: rating,
        customerId: customerId,
        desc: desc
    });
    console.log("Send add_feeback " + util.inspect(value));
    await producer.send({
        topic: "add_feedback",
        messages: [{
            key: "", value: value
        }]
    });
    res.send("Ok");
});

app.get('/geolocation/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    if (!('long' in req.query)) {
        res.send("Attribute 'long' for the longitude needed");
        return;
    }
    const long = req.query.long;
    if (!('lat' in req.query)) {
        res.send("Attribute 'lat' for the latitude needed");
        return;
    }
    const lat = req.query.lat;
    let requestId = uuidv4();
    let value = JSON.stringify({
        orderId: orderId,
        geoloc: {long: long, lat: lat},
        requestId: requestId
    });
    producer.send({
        topic: "get_coursier_geoloc",
        messages: [{
            key: "", value: value
        }]
    });
    creationInstances.set(requestId, {
        res: res,
        checkFinish: function (topic, message, data) {
            res.send(data);
            return true;
        }

    });
});


app.listen(port, () => console.log(`Gateway Customer listening on port ${port}!`));