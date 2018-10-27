const request = require("request-promise");
const assert = require("assert");

let customer_ws = "http://localhost:8097";
let eta_url = "http://localhost:9090";
let coursier_url = "http://localhost:8090";
let restaurant_url = "http://localhost:8080";


// assumption: the client is already connected
var client = { id: 23, address: "742 Evergreen Terrace", name: "Homer", phone: "0608724762" };
var order = null;

var orderId = null;
request({ url: `${customer_ws}/meals`, qs: { category: "Asian" } }, function (error, response, body) {
    assert(response.statusCode, 200);
    console.log("meals", body);
}).then(function (meals) {
    console.log(meals)
})