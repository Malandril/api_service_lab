import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
const mongoose = require("mongoose");
import expressValidator from "express-validator";



// Controllers (route handlers)
import MONGODB_URI from "./util/links";
import {DeliveryStatus} from "./models/delivery-status";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
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

import * as coursierRoute from "./controllers/coursier";
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