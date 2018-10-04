'use strict';

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
                let _orderObj = JSON.parse(JSON.stringify(orderObj));
                if (_orderObj.meals == null){
                    resolve('Your order must contain a list of meals.');
                }
                let totalETA = 0;
                for (let i = 0; i < _orderObj.meals.length; i++) {
                    if(_orderObj.meals[i].eta == null){
                        resolve('This meal does not have an ETA : '+JSON.stringify(_orderObj.meals[i]));
                    } else {
                        totalETA += _orderObj.meals[i].eta
                    }
                }
                resolve(totalETA);
            });
        }
    }
};

module.exports = methods;