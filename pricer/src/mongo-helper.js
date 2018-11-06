const MongoClient = require('mongodb').MongoClient;

const MAX_RETRY = 5;
module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://mongo_pricer:27017/", {useNewUrlParser: true});
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

                    obj.db = obj.client.db("pricer");
                    obj.db.createCollection("vouchers",
                        function (err, results) {
                        if(!err)
                            console.log("vouchers collection created.");
                            //client.close();
                        }
                    );
                }
            });
        };
        connectWithRetry()
    },
    findVoucherByCodeRestaurant: function (restaurantId, code) {
        return this.db. collection("vouchers").findOne({"restaurantId": restaurantId, "code": code});
    }
};