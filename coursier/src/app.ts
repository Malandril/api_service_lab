import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";


import expressValidator from "express-validator";


// Controllers (route handlers)
import MONGODB_URI from "./util/links";

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
    reconnectInterval: 2000,
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

import * as coursierRoute from "./route/coursier";
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
app.get("/deliveries", coursierRoute.getDeliveries);
app.get("/deliveries/:id", coursierRoute.deliveryStatus);
app.put("/deliveries/:id", coursierRoute.updateStatus);

/**
 * API examples routes.
 */

export default app;