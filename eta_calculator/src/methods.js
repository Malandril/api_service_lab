'use strict';

let methods = {
    calculateETA: function (msg, producer) {
        console.log(msg.toString());
        let _orderObj = JSON.parse(msg);
        if (_orderObj.meals == null) {
            console.error('Your order must contain a list of meals.');
        } else {
            let totalETA = 0;
            for (let i = 0; i < _orderObj.meals.length; i++) {
                if (_orderObj.meals[i].eta == null) {
                    console.error('This meal does not have an ETA : ' + JSON.stringify(_orderObj.meals[i]));
                } else {
                    totalETA += _orderObj.meals[i].eta
                }
            }
            let response = {
                eta:  totalETA,
                requestId: _orderObj.requestId
            };
            console.log("Send event eta_result : " + JSON.stringify(response));
            producer.send({
                topic:"eta_result",
                messages: [{key:"", value: JSON.stringify(response)}]
            });
        }
    }
};

module.exports = methods;