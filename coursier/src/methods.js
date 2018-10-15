'use strict';
const util = require('util');
let methods = {
    addOrder : function (txt, db) {
        console.log("added : " +util.inspect(txt, {showHidden: false, depth: null}) )
        var msg = JSON.parse(txt);
        if(!("order" in msg) || !("meals" in msg.order)){
            console.log("Error : Not enough data")
        }else{
            db.collection('orders').insertOne(msg, function(err, r) {
               console.log("added : "+ r );
            });
        }
    },
    getOrderedToBeDelivered: function (msg, producer, db) {
        msg = JSON.parse(msg);
        if("coursier" in msg &&"address" in msg.coursier){
            var id = msg.coursier.address.split(" ");
            var orders = [];
            db.collection('orders').find({}).limit(10).each(function(err, doc) {
                if(doc){

                    orders.push(doc);
                }else{
                    let resp = {
                        orders:  orders
                    };
                    console.log("send event to list_orders_to_be_delivered" + JSON.stringify(resp) );
                    producer.send({
                        topic:"list_orders_to_be_delivered",
                        messages: [{key:"", value: resp}]
                    });
                }
            });

        }else{
            console.log("Error : Not enough data : need {coursier:{id}}");
        }
        console.log(msg);

        
    },

    deleteOrder: function (msg, db) {
        msg = JSON.parse(msg);
        db.collection('orders').deleteOne(msg, function(err, r) {
            console.log("deleted : "  + r);
        });
    }
};

module.exports = methods;