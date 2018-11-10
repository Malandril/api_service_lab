'use strict';
const util = require('util');
let methods = {
    orderDelivered: function (msg, db) {
        console.log("order delivered received", msg);
        db.collection("accounts").findOneAndUpdate({"coursierId": msg.coursierId}, {$inc: {credits: 1}})
    },
    getCredits: async function (msg, db, producer) {
        let account = await db.collection("accounts").findOne({"coursierId": msg.coursierId});
        console.log("getting credits", msg);
        if (account) {

            await producer.send({
                "topic": "coursier_credits",
                "messages": [{
                    "key": "",
                    "value": JSON.stringify({
                        requestId: msg.requestId,
                        coursierId: msg.coursierId,
                        credits: account.credits
                    })
                }]
            });
        }
    }
};

module.exports = methods;