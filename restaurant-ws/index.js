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
    clientId: 'restaurantws',
});


const toDoMeals = kafka.consumer({groupId: 'todo_meals'});
const OrderDelivered = kafka.consumer({groupId: 'order_delivered'});
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await toDoMeals.connect();
    await toDoMeals.subscribe({topic: "todo_meals"});
    await toDoMeals.run({
        eachMessage: async ({topic, partition, message}) => {
            if (!queue.isEmpty()) {
                queue.dequeue()(message);
            } else {
                console.log("Unable to process todo_meals response: " + message.value)
            }
        }
    });

    await OrderDelivered.connect();
    await OrderDelivered.subscribe({topic: "order_delivered"});
    await OrderDelivered.run({
        eachMessage: async ({topic, partition, message}) => {
            console.log("Order with ID "+message.value.order.id+" has been delivered !");
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
        restaurantId : 12
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
        let result = "";
        if (msg.value.orders != null){
            const orders = msg.value.orders;
            for (let i = 0; i < orders.length; i++) {
                result += "Order with ID "+orders[i].id+" :\n";
                if (orders[i].meals == null || orders[i].meals.length === 0){
                    result += "   No meal for this order\n";
                } else {
                    let meals = orders[i].meals;
                    for (let j = 0; j < meals.length; j++) {
                        result += "   - "+meals.name+"\n";
                    }
                }
            }
        }
        res.send(result);
    })


});

app.put('/orders/', (req, res) => {
    if (!("orderId" in req.body)) {
        res.send("Attribute 'orderId' needed");
        return;
    }
    const orderId = req.body.orderId;
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

});



app.listen(port, () => console.log(`Restaurant Gateway app listening on port ${port}!`));