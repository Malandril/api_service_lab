const MongoClient = require('mongodb').MongoClient;
const MAX_RETRY = 5;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://mongo_order:27017/", {useNewUrlParser: true});
        let count = 0;

        let connectWithRetry = function () {
            obj.client.connect(function (err) {
                if (err) {
                    if (count === MAX_RETRY) {
                        console.error("Couldn't connect to mongo database", err);
                        throw err;
                    }
                    console.log('Failed to connect to mongo on startup - retrying in 5 sec');
                    count++;
                    setTimeout(connectWithRetry, 15000);
                } else {
                    console.log("Connected successfully to server");
                    obj.db = obj.client.db("orders");


                    obj.db.createCollection("orders", {"capped": true, "size": 100000, "max": 5000},
                        function (err, results) {
                            console.log("Collection created." + err + results);
                            //client.close();
                        }
                    );
                }
            });
        };
        connectWithRetry()
    },
    addEvent: function (orderId, eventToPush) {
        this.db.collection('orders').findOneAndUpdate(
            {"_id": orderId},
            {$push: {"events": eventToPush}}
        );
    }
}