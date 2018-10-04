const request = require("request-promise");
const assert = require("assert");

let order_url = "http://localhost:8000";
let eta_url = "http://localhost:8070";


// getting all meals
request({url: `${order_url}/meals`, qs: {category: "Asian"}}, function (error, response, body) {
    assert(response.statusCode, 200);
    console.log("meals", body);
}).then(function (meals) {
    let order = {client: 23, meals: JSON.parse(meals)};
    return request.post({
            url: `${order_url}/orders`,
            form: order
        }, function (error, response, body) {
            assert(response.statusCode, 201);
            console.log("ordered", body);
        }
    );
}).then(function (order) {
    console.log("order", {order: JSON.parse(order)});
    return request.post({
        url: `${eta_url}/eta`,
        form: {order: JSON.parse(order)}
    }, function (error, response, body) {
        assert(response.statusCode, 200);
        console.log("eta", body)
    });

});

// adding order
