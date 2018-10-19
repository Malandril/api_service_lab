'use strict';
const util = require('util');
let methods = {
    orderDelivered: function (msg, db) {
        msg = JSON.parse(msg);
        console.log("order delivered received", msg)
    }
};

module.exports = methods;