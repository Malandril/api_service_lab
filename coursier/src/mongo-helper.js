/**
 * Created by Hasaghi on 15/10/2018.
 */
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://localhost:27016/" , { useNewUrlParser: true });
        obj.client.connect(function(err) {
            console.log("Connected successfully to server");
            console.log(err);
            obj.db = obj.client.db("coursier");


            obj.db.createCollection("orders", { "capped": true, "size": 100000, "max": 5000},
                function(err, results) {
                    console.log("Collection created." + err + results);
                    //client.close();
                }
            );
        });
    }
}