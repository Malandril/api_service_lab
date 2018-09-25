"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var compression_1 = require("compression"); // compresses requests
var body_parser_1 = require("body-parser");
var path_1 = require("path");
var mongoose_1 = require("mongoose");
var express_validator_1 = require("express-validator");
// Controllers (route handlers)notifyOrder
var coursierController = require("./controllers/coursier");
var links_1 = require("./util/links");
// Create Express server
var app = express_1.default();
// Connect to MongoDB
var mongoUrl = links_1.default;
mongoose_1.default.connect(mongoUrl, { useNewUrlParser: true }).then(function () {
}).catch(function (err) {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});
// Express configuration
app.set("port", process.env.PORT || 4000);
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_validator_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
app.post("/coursiers/order", coursierController.notifyOrder);
exports.default = app;
