import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
const mongoose = require("mongoose");
import expressValidator from "express-validator";



// Controllers (route handlers)
const links = require("./util/links");
import {DeliveryStatus} from "./models/delivery-status";
const { Kafka, logLevel } = require("kafkajs");

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = links.mongo;
mongoose.connect(mongoUrl, {useNewUrlParser: true}).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    }
);
const newVar: SchemaDefinition = {
    id: {type: Number, unique: true},
    creation: Number,
    status: String,
    history: [{status: String, event: String}]

};
const statusSchema = new mongoose.Schema(newVar);
mongoose.model("DeliveryStatus", statusSchema );
console.log("Model : " + statusSchema);

import * as coursierRoute from "./route/coursier";
import {SchemaDefinition} from "mongoose";
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());

app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);
const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: [links.kafka],
    clientId: "",
});



const topics = ["order_cooked", "nearby_order", "finalise_order" ];
const consumer = kafka.consumer({ groupId: "eta_calculator" });
const producer = kafka.producer();
const run = async () => {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe(topics);
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
           coursierRoute.routeMessage(topic, partition, message, producer);

        },
    });
};



/**
 * Primary app routes.
 */
app.post("/deliveries", coursierRoute.notifyOrder);
app.get("/deliveries/:id", coursierRoute.deliveryStatus);
app.put("/deliveries/:id", coursierRoute.updateStatus);

/**
 * API examples routes.
 */

export default app;