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
    clientId: 'customerws',
});


const mealsListed = kafka.consumer({groupId: 'meals_listed'});
const etaResult = kafka.consumer({groupId: 'eta_result'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await mealsListed.connect();
    await mealsListed.subscribe({topic: "meals_listed"});
    await mealsListed.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("eachMessage " + topic + " " + message);
            if (!queue.isEmpty()) {
                queue.dequeue()(message);
            } else {
                console.log("Unable to process list_orders_to_be_delivered response: " + message.value)
            }
        }
    });

    await etaResult.connect();
    await etaResult.subscribe({topic: "eta_result"});
    await etaResult.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("The ETA of your order is " + message.value);
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
        let result = "";
        if (msg.value.meals != null){
            const meals = msg.value.meals;
            for (let i = 0; i < meals.length; i++) {
                result += "- "+meals[i].name+" of the restaurant "+meals[i].restaurant.name+" : Price "+meals[i].price+"\n";
            }
        }
        res.send(result);
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

});



app.listen(port, () => console.log(`Gateway Customer listening on port ${port}!`));