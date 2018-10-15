'use strict';
const util = require('util');
let methods = {
    routeByTopic: function (topic, message) {
        console.log(topic + "message" + message);
    },
    addOrder : function (txt, db) {
        console.log("added : " +util.inspect(txt, {showHidden: false, depth: null}) )
        var msg = JSON.parse(txt);
        if(!("order" in msg) || !("meals" in msg.order)){
            console.log("Error : Not enough data")
        }else{
            db.collection('orders').insertOne(msg, function(err, r) {
               console.log("added : "+ err +util.inspect(r, {showHidden: false, depth: null}) )
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer) {
        console.log(util.inspect(msg, {showHidden: false, depth: null}));
        msg = JSON.parse(msg);
        console.log(util.inspect(msg, {showHidden: false, depth: null}));
        if("coursier" in msg &&"address" in msg.coursier){
            var id = msg.coursier.address.split(" ");
            let resp = {
                orders:  [
                    {
                        id: 12,
                        restaurant: {
                            address:(id - 2) +" rue de sophia"
                        },
                        customer: {
                            address:(id + 2) + "5 rue d'antibes"
                        },
                        mustBePayed: true
                    }
                ]
            };
            console.log("send event to list_orders_to_be_delivered" + util.inspect(resp, {showHidden: false, depth: null}) );
            producer.send({
                topic:"list_orders_to_be_delivered",
                messages: [{key:"", value: resp}]
            });
        }else{
            console.log("Error : Not enough data : need {coursier:{id}}");
        }
        console.log(msg);

        
    }
    /*
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
    }     */

};

module.exports = methods;