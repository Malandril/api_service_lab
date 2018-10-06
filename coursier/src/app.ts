import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";

const mongoose = require("mongoose");

import {Schema, Document, model, Model} from "mongoose";

import expressValidator from "express-validator";


// Controllers (route handlers)
import MONGODB_URI from "./util/links";
import {DeliveryStatus} from "./models/delivery-status";

// Create Express server
const app = express();

// Connect to MongoDB
const MAX_TRIES = 5;
let tries = 0;
const mongoUrl = MONGODB_URI;
const connectWithRetry = () => mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    reconnectTries: 5,
    autoReconnect: true,
    reconnectInterval: 10000,
    connectTimeoutMS: 10000
}).catch(reason => {
    if (tries < MAX_TRIES) {
        console.log("MongoDB connection unsuccessful, retry after 2 seconds.");
        tries++;
        setTimeout(connectWithRetry, 2000);
    } else {
        console.log("Could not connect to MongoDB");
        throw reason;
    }

});
connectWithRetry();

const Order: SchemaDefinition = {
    id: String
};

const Customer: SchemaDefinition = {
    id: String,
    address: String,
    name: String,
    phone: String
};

mongoose.model("Order", Order);
mongoose.model("Customer", Customer);
const newVar: SchemaDefinition = {
    id: {type: Number, unique: true},
    creation: Number,
    order: {type: Schema.Types.ObjectId, ref: "Order"},
    customer: {type: Schema.Types.ObjectId, ref: "Customer"},
    status: String,
    history: [{status: String, event: String}]

};
const statusSchema = new mongoose.Schema(newVar);
mongoose.model("DeliveryStatus", statusSchema);
console.log("Model : " + statusSchema);

import * as coursierRoute from "./route/coursier";
import {SchemaDefinition, Types} from "mongoose";
// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());

app.use(
    express.static(path.join(__dirname, "public"), {maxAge: 31557600000})
);

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