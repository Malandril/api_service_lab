const request = require("request-promise");
const assert = require("assert");

let order_url = "http://localhost:8000";
let eta_url = "http://localhost:9090";
let coursier_url = "http://localhost:8090";
let restaurant_url = "http://localhost:8080";


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
    return request.post({
        url: `${restaurant_url}/ordersToPrepare`,
        json: order
    }, function (error, response, body) {
        assert(response.statusCode, 201);
        console.log("Posted order to restaurants ", body)
    });
}).then(function (o) {
    order = o;
    console.log("order", {calculateETA: order});
    return request.post({
        url: `${eta_url}/eta`,
        json: {calculateETA: order}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("The ETA of my order is ", body)
    });
}).then(function () {
    return request.post({
        url: `${coursier_url}/deliveries`,
        form: {id: order.id, customer: client}
    }, function (error, response, body) {
        assert(response.statusCode, 201);
        console.log("coursier response", body)
    })
}).then(function (id) {
    orderId = JSON.parse(id).orderId;
    // console.log(id);
    console.log("orderID", orderId);
    return request.put({
        url: `${coursier_url}/deliveries/${orderId}`,
        json: {status: "OK"}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("Restaurant updated status")
    })
}).then(function () {
    console.log("co");
    return request.get(`${coursier_url}/deliveries/${orderId}`,
        function (error, response, body) {
            assert(response.statusCode, 200);
            console.log("Delivery man notified of order status", body);
            /* Delivery man notified of order status {"status":"OK"} value :  undefined */
            var res = JSON.parse(body);
            console.log(res.status,res.status === "OK",res["status"]);

            assert(res.status, "OK");
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
