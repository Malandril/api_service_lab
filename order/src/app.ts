import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";
import expressValidator from "express-validator";


import MONGODB_URI from "./util/links";
const util = require("util");

const { Kafka, logLevel } = require('kafkajs');
// Route handlers
import mealRouter from "./routes/meals/router";
import orderRouter from "./routes/orders/router";
import customerRouter from "./routes/customers/router";


// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.connect(mongoUrl, {useNewUrlParser: true}).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    },
).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());

app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);


// Kafka configuration


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["kafka:9092"],
    connectionTimeout: 3000,
    clientId: "order",
});
const submit_order = kafka.consumer({groupId: "submit_order"});
const payment_failed = kafka.consumer({groupId: "payment_failed"});
const payment_succeeded = kafka.consumer({groupId: "payment_succeeded"});
const payment_not_needed = kafka.consumer({groupId: "payment_not_needed"});
const create_order_request = kafka.consumer({groupId: "create_order_request"});
const assign_delivery = kafka.consumer({groupId: "assign_delivery"});
const meal_cooked = kafka.consumer({groupId: "meal_cooked"});
const order_delivered = kafka.consumer({groupId: "order_delivered"});

const producer = kafka.producer();

const consumers = [submit_order, payment_failed, payment_succeeded, payment_not_needed, create_order_request, assign_delivery, meal_cooked, order_delivered];

const TOPICS = ["create_order", "finalise_order"];

const run = async () => {
    await producer.connect();
    await consumers.forEach(function (consumer) {

        consumer.connect(consumer.groupId);
        consumer.subscribe({topic: consumer.groupId});
        consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log("Read :" + topic + util.inspect(message.value.toString()));
            }
        });

    });
};


/**
 * Primary app routes.
 */
app.use("/meals", mealRouter);
// app.use("/orders", orderRouter);
app.use("/customers", customerRouter);

