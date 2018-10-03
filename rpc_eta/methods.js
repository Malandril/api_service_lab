'use strict';

// let db = require('./db');

let methods = {
    calculateETA: {
        description: `calculates the ETA for the order, and returns it`,
        params: ['order:the order object'],
        returns: ['order'],
        exec(orderObj) {
            return new Promise((resolve) => {
                if (typeof (orderObj) !== 'object') {
                    throw new Error('An object was expected');
                }
                // you would usually do some validations here
                // and check for required fields
                let _orderObj = JSON.parse(JSON.stringify(orderObj));
                let totalETA = 0;
                for (let i = 0; i < _orderObj.meals.length; i++) {
                    // totalETA += db.etas.getETA(_orderObj.meals[i])
                    totalETA += _orderObj.meals[i].eta
                }
                resolve(totalETA);
            });
        }
    }
};

module.exports = methods;