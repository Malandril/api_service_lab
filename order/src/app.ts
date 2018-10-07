import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import path from "path";
import mongoose from "mongoose";
import expressValidator from "express-validator";


import MONGODB_URI from "./util/links";

// Route handlers
import mealRouter from "./routes/meals/router";
import orderRouter from "./routes/orders/router";
import customerRouter from "./routes/customers/router";


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
app.use("/meals", mealRouter);
app.use("/orders", orderRouter);
app.use("/customers", customerRouter);

/** Seed meal database if empty */
import getMeals from "./routes/meals/router";
import {MealModel} from "./models";
import {IMealModel} from "./models/MealModel";
MealModel.find().then((meals: IMealModel[]) => {
    if (meals.length === 0) {
        const m1 = new MealModel();
        m1.name = "Pizza";
        m1.price = 8;
        m1.eta = 5;
        m1.category = "Italian";

        const m2 = new MealModel();
        m2.name = "Ramen soup";
        m2.price = 4;
        m2.eta = 2;
        m2.category = "Asian";

        const m3 = new MealModel();
        m3.name = "Nems";
        m3.price = 6;
        m3.eta = 4;
        m3.category = "Asian";

        const m4 = new MealModel();
        m4.name = "Sushis";
        m4.price = 9;
        m4.eta = 4;
        m4.category = "Asian";

        MealModel.create([m1, m2, m3, m4]);

        for (let i = 0; i < 26; i++) {
            const m = new MealModel();
            m.name = "Sushis";
            m.price = 9;
            m.eta = 4;
            m.category = "Asian";

            MealModel.create(m);
        }
    }
});

export default app;