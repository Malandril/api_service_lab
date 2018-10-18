/**
 * Created by Hasaghi on 15/10/2018.
 */
const MongoClient = require('mongodb').MongoClient;

module.exports = {
    client: null,
    db: null,
    initialize: function (obj) {
        obj.client = new MongoClient("mongodb://mongo_delivery_man:27018/" , { useNewUrlParser: true });
        obj.client.connect(function(err) {
            console.log("Connected successfully to server");
            console.log(err);
            obj.db = obj.client.db("delivery_man");
            obj.db.createCollection("delivery_man", { "capped": true, "size": 100000, "max": 5000},
                function(err, results) {
                    console.log("Collection created." + err + results);
                    //client.close();
                }
            );
        });
    }
};