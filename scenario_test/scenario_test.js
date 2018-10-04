const request = require("request-promise");
const assert = require("assert");

let order_url = "http://localhost:8000";
let eta_url = "http://localhost:9090";
let coursier_url = "http://localhost:8090";


// assumption: the client is already connected
var client = {id: 23, address: "742 Evergreen Terrace", name: "Homer", phone: "0608724762"};
var order = null;

var orderId = null;
request({url: `${order_url}/meals`, qs: {category: "Asian"}}, function (error, response, body) {
    assert(response.statusCode, 200);
    console.log("meals", body);
}).then(function (meals) {
    let order = {client: client.id, meals: JSON.parse(meals)};
    return request.post({
            url: `${order_url}/orders`,
            form: order
        }, function (error, response, body) {
            assert(response.statusCode, 201);
            console.log("ordered", body);
        }
    );
}).then(function (o) {
    order = JSON.parse(o);
    console.log("order", {calculateETA: order});
    return request.post({
        url: `${eta_url}/eta`,
        form: {calculateETA: order}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("The ETA of my order is ", body)
    });
}).then(function () {
    return request.post({
        url: `${coursier_url}/meals`,
        form: {id: order.id, customer: client}
    }, function (error, response, body) {
        assert(response.statusCode, 201);
        console.log("coursier response", body)
    })
}).then(function (id) {
    orderId = JSON.parse(id).orderId;
    console.log("order", order, "orderId", orderId);
    return request.put({
        url: `${coursier_url}/deliveries/${orderId}`,
        form: {status: "OK"}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("Restaurant updated status")
    })
}).then(function () {
    return request.get(`${coursier_url}/deliveries/${orderId}`,
        function (error, response, body) {
            assert(response.statusCode, 200);
            console.log("Delivery man notified of order status", body);
            assert(body.status, "OK");
        })
}).then(function (status) {
    status = JSON.parse(status);
    return request.put({
        url: `${coursier_url}/deliveries/${status.id}`,
        form: {status: "Delivered"}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("Delivery man updated status to delivered")
    })
});

// adding order
