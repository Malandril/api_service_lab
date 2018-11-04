const request = require("request-promise");
const assert = require("assert");

let customer_ws = "http://localhost:8097";
let coursier_url = "http://localhost:8099";
let restaurant_url = "http://localhost:8098";


// assumption: the client is already connected
var client = {id: 23, address: "742 Evergreen Terrace", name: "Homer", phone: "0608724762"};
var order = null;
var coursierId = 18;
var orderId = null;
var restaurantId = null;
function coursierAction() {
    console.log("Un coursier du coin liste les orders");
    new Promise(
        function (resolve, reject) {
            request({
                url: `${coursier_url}/deliveries`,
                qs: {id: coursierId, address: "3 Rue principale"}
            }, function (error, response, body) {
            }).then(function (res) {
                console.log("Liste : "+ res);
                resolve(res);
            }).catch(reject);
        })
        .then(function (e) {
            var data = JSON.parse(e);

            console.log("Orders : " + data.orders.length);
            let id = data.orders[data.orders.length - 1].id;
            console.log("We chose to deliver order ", id);
            request({
                url: `${coursier_url}/deliveries`,
                method: 'POST',
                body: {orderId: id, coursierId: coursierId},
                json: true
            }).then(function (res) {
                console.log("res1", res);
                request({
                    url: `${coursier_url}/deliveries/${id}`,
                    method: 'PUT',
                    body: {orderId: id, coursierId: coursierId},
                    json: true
                }).then(function (res) {
                    console.log("end result " + res);
                });
            });
        });
}

function restaurantAction() {
    new Promise(
        function (resolve, reject) {
            request({
                url: `${restaurant_url}/orders/`,
                qs: {id: coursierId}
            }, function (error, response, body) {
            }).then(function (res) {

                resolve(res);
            }).catch(reject);
        })
        .then(function (e) {
            var data = JSON.parse(e);
            console.log(data);
        }).catch(function (e) {
        console.log(e);
    });
}

request({url: `${customer_ws}/meals`, qs: {categories: ["burger"]}}, function (error, response, body) {
    assert(response.statusCode, 200);
}).then(function (meals) {
    let parse = JSON.parse(meals);
    var data = parse.meals[0];
    console.log("Meals returned : " + parse.meals.length);
    order = {
        meals: [data],
        customer: {
            name: "Bob",
            address: "3 Privet Drive",
        }
    };
    request({
        url: `${customer_ws}/orders/`,
        method: 'POST',
        body: order,
        json: true
    }).then(function (resp) {
        console.log("The ETA of Bob's order is  ", resp.eta, " minutes");

        var finalisation = {
            orderId: resp.orderId,
            customer: order.customer,
            meals: order.meals,
            creditCard: {
                name: "Bob",
                number: 551512348989,
                ccv: 775,
                limit: "07/19"
            }
        };
        request({
            url: `${customer_ws}/orders/${resp.orderId}`,
            method: 'PUT',
            body: finalisation,
            json: true
        }).then(function (resp) {
            console.log("resp" + resp);
            console.log("Ok, deux process à partir de maintenant: ");
            coursierAction();
            restaurantAction();
        });
    });
});