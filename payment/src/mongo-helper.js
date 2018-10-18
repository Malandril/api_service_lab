
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://mongo_payment:27019/" , { useNewUrlParser: true });
        obj.client.connect(function(err) {
            console.log("Connected successfully to server");
            console.log(err);
            obj.db = obj.client.db("payment");


            obj.db.createCollection("payments", { "capped": true, "size": 100000, "max": 5000},
                function(err, results) {
                    console.log("Collection created." + err + results);
                    //client.close();
                }
            );
        });
    }
}