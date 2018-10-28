const MongoClient = require('mongodb').MongoClient;
const MAX_RETRY = 5;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj, seed_function) {
        obj.client = new MongoClient("mongodb://mongo_catalog:27017/", {useNewUrlParser: true});
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
                    obj.db = obj.client.db("catalog");


                    obj.db.createCollection("meals", {},
                        function (err, results) {
                            console.log("Collection created." + err + results);
                            seed_function(obj.db);
                            //client.close();
                        }
                    );

                }
            });
        };
        connectWithRetry()
    }
}