/**
 * Created by Hasaghi on 15/10/2018.
 */
const MongoClient = require('mongodb').MongoClient;
const MAX_RETRY = 5;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://localhost:27016/", {useNewUrlParser: true});
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
                    setTimeout(connectWithRetry, 5000);
                } else {
                    console.log("Connected successfully to server");
                    obj.db = obj.client.db("coursier");


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
    }
}