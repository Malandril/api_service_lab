const MongoClient = require('mongodb').MongoClient;
const config = require('./configuration.js');

const MAX_RETRY = 5;
module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient(config.MONGO_URL, {useNewUrlParser: true});
        let count = 0;
        let connectWithRetry = function () {
            obj.client.connect(function (err) {
                if (err) {
                    if (count === MAX_RETRY) {
                        console.error("Couldn't connect to mongo database", err);
                        throw err;
                    }
                    console.error('Failed to connect to mongo on startup - retrying in 5 sec');
                    count++;
                    setTimeout(connectWithRetry, 5000);
                } else {
                    console.log("Connected successfully to server");

                    obj.db = obj.client.db("payment");
                    obj.db.createCollection("payments", {"capped": true, "size": 100000, "max": 5000},
                        function (err, results) {
                        if(!err)
                            console.log("Payment collection created.");
                            //client.close();
                        }
                    );
                }
            });
        };
        connectWithRetry()
    }
};