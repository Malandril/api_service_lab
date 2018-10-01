const request = require("request-promise");
const assert = require("assert");

let order_url = "http://localhost:3000";


// getting all meals
request(`${order_url}/meals`, null, function (error, response, body) {
    assert(response.statusCode, 200);
    console.log(body);
    return body[0]
}).then(function (meal) {
   return request.post(`${order_url}/orders`, {client: 23, meal: [meal]}, function (error, response, body) {
            assert(response.statusCode, 201);
            console.log(body);
        }
    );
}).then(function (order) {
    console.log(order);

});

// adding order
