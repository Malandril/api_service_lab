import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";
import expressValidator from "express-validator";


// Controllers (route handlers)
import * as coursierRoute from "./controllers/coursier";
import MONGODB_URI from "./util/links";


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

/**
 * Primary app routes.
 */
app.post("/meals", coursierRoute.notifyOrder);

/**
 * API examples routes.
 */

export default app;