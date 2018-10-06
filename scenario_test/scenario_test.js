const request = require("request-promise");
const assert = require("assert");

let order_url = "http://localhost:8000";
let eta_url = "http://localhost:9090";
let coursier_url = "http://localhost:8090";
let restaurant_url = "http://localhost:8080";

var bob = {address: "742 Evergreen Terrace", name: "Bob", phone: "0608724762"};
var client = null;
var order = null;
var orderId = null;
var meals = null;
var delivery = null;

console.log("### Registering Bob ###");
request.post({
    url: `${order_url}/customers`,
    json: bob
}, (error, response, body) => {
    assert(response.statusCode, 200);
    console.log("Bob is registered " + JSON.stringify(body));
}).then((c) => {
    client = c;
    console.log("### Bob browses the food catalogue for Asian food ###");
    return request({url: `${order_url}/meals`, qs: {category: "Asian"}}, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("Asian meals available : ", body);
    });
}).then(function (m) {
    meals = JSON.parse(m);
    console.log("### Bob orders a ramen soup ###");
    let order = {client: client, meals: meals};
    return request.post({
            url: `${order_url}/orders`,
            form: order
        }, function (error, response, body) {
            assert(response.statusCode, 201);
            console.log("Bob's order is : ", body);
        }
    );
}).then(function (o) {
    console.log("### Bob's order is sent to the asian restaurant ###");
    order = JSON.parse(o);
    return request.post({
        url: `${restaurant_url}/ordersToPrepare`,
        json: order
    }, function (error, response, body) {
        assert(response.statusCode, 201);
        console.log("The posted order to the restaurant is : ", body)
    });
}).then(function (o) {
    console.log("### The system estimates the ETA for Bob's order ###");
    console.log(o);
    order = o;
    return request.post({
        url: `${eta_url}/eta`,
        json: {calculateETA: {"meals": meals}}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        let eta_value;
        try{
            eta_value= body.calculateETA;
        }catch (error){
            eta_value = body.calculateETA;
        }
        console.log("The ETA of Bob's order is  ", eta_value, " minutes")
    });
}).then(function () {
    console.log("### The delivery man is assigned to the delivery of Bob's order ###", {order: {id: order._id}, customer: {id: client._id, address: bob.address, name: bob.name, phone: bob.phone}});
    return request.post({
        url: `${coursier_url}/deliveries`,
        form: {order: {id: order._id}, customer: {id: client._id, address: bob.address, name: bob.name, phone: bob.phone}}
    }, function (error, response, body) {
        assert(response.statusCode, 201);
        console.log("The delivery man's response is ", body);

    })
}).then(function (ds) {
    console.log("### The restaurant informs the delivery man that Bob's order is ready to be delivered ###", ds);
    delivery = JSON.parse(ds);
    delivery.status = "OK";
    return request.put({
        url: `${coursier_url}/deliveries/${delivery._id}`,
        json: delivery
    }, function (error, response, body) {
        if(error){
            console.log(error);
        }else{
            console.log(body);
        }
        assert(response.statusCode, 200);
        console.log("The restaurant has updated the status of the delivery")
    })
}).then(function (rr) {
    console.log("### The delivery man gets the update that Bob's order is ready to be delivered ###");
    return request.get(`${coursier_url}/deliveries/${delivery._id}`,
        function (error, response, body) {
            console.log("body :",body);
            assert(response.statusCode, 200);
            var res = JSON.parse(body);
            assert(res.status, "OK");
            console.log("The delivery man is notified that the order status is now ", res.status, "to be delivered");
        })
}).then(function (status) {
    console.log("### The delivery man updates the status of the delivery to delivered when Bob got his ramen soup ###");
    delivery.status = "DELIVERED";
    return request.put({
        url: `${coursier_url}/deliveries/${delivery._id}`,
        json: delivery
    }, function (error, response, body) {
        if(error){
            console.log(error);
        }else{
            console.log(body);
        }
        assert(response.statusCode, 200);
        console.log("The restaurant has updated the status of the delivery")
    })
}).then(() => {
    console.log("Scenario runned successfully :)")
});
