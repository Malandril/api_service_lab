const request = require("request-promise");
const assert = require("assert");

let customer_ws = "http://localhost:8097";
let restaurant_url = "http://localhost:8098";
let coursier_url = "http://localhost:8099";


// assumption: the client is already connected
var client = {id: 23, address: "742 Evergreen Terrace", name: "Homer", phone: "0608724762"};
var order = null;
var coursierId = 18;
var orderId = null;
var restaurantId = null;

function coursierAction() {
    console.log("Un coursier du coin liste les orders");
    return new Promise(
        function (resolve, reject) {
            request({
                url: `${coursier_url}/deliveries`,
                qs: {id: coursierId, address: "3 Rue principale"}
            }).then(function (res) {
                console.log("Liste : " + res);
                resolve(res);
            }).catch(reject);
        })
        .then(function (e) {
            var data = JSON.parse(e);

            console.log("Il y a " + data.orders.length + " commandes proche à livrer");
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
    return new Promise(
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
            request({
                url: `${restaurant_url}/orders/${orderId}`,
                method: 'PUT',
                body: {orderId: orderId},
                json: true
            }).then(function (res) {
                console.log("resp :" + res);
            }).catch(function (err) {
                console.log("ERROR : " + err);
                process.exit(1)
            });
        }).catch(function (e) {
            console.log(e);
        });
}

request({url: `${customer_ws}/meals`, qs: {categories: ["burger"]}}).then(function (meals) {
    let parse = JSON.parse(meals);
    var data = parse.meals[0];
    restaurantId = data.restaurant.id;
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
        orderId = resp.orderId;
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
        }).then(function () {
            console.log("La commande de Gail est validée. Id = " + orderId);
            request({
                url: `${restaurant_url}/orders/`,
                qs: {id: restaurantId}
            }).then(function (res) {
                const data = JSON.parse(res);
                console.log("Le restaurateur liste les plats à préparer :");
                var commandFound = false;
                data.orders.forEach(o => {
                    console.log(o.orderId);
                    if (o.orderId === orderId) {
                        commandFound = true;
                    }
                });
                if (!commandFound) {
                    console.log("Le restaurateur ne trouve pas la commande de Gail oO");
                } else {
                    console.log("Jamie liste les commandes proches");
                    request({
                        url: `${coursier_url}/deliveries`,
                        qs: {id: coursierId, address: "3 Rue principale"}
                    }).then(function (res) {
                        var commandFound = false;
                        var data= JSON.parse(res);
                        data.orders.forEach(order => {
                            console.log(order.id);
                            if (order.id === orderId) {
                                commandFound = true;
                            }
                        });
                        if (!commandFound) {
                            console.log("Jamie ne trouve pas la commande");

                        } else {
                            console.log("Jamie s'occuper de la commande " + orderId);
                            request({
                                url: `${coursier_url}/deliveries`,
                                method: 'POST',
                                body: {orderId: orderId, coursierId: coursierId},
                                json: true
                            }).then(function (res) {
                                console.log("TODO: jamie meurt");
                                console.log("Jordan le cuisto a fini le Mac First ");
                                request({
                                    url: `${restaurant_url}/orders/${orderId}`,
                                    method: 'PUT',
                                    body: {orderId: orderId},
                                    json: true
                                }).then(function (res) {
                                    console.log("Jamie récupère la commande et met à jour sa position");
                                    request({
                                        url: `${coursier_url}/geolocation`,
                                        method: 'PUT',
                                        body: {orderId: orderId, coursierId: coursierId,timestamp: Math.round((Date.now()) / 1000),geolocation : {long: 12, lat: 42} },
                                        json: true
                                    }).then(function (res) {
                                        console.log("Gail traque Jamie");
                                        request({
                                            url: `${customer_ws}/geolocation/${orderId}`
                                        }).then(function (res) {
                                            console.log("Jamie vient de livrer la commande à Gail.", res);
                                            request({
                                                url: `${coursier_url}/deliveries/${orderId}`,
                                                method: 'PUT',
                                                body: {coursierId: coursierId},
                                                json: true
                                            }).then(function () {
                                                console.log("Gail, contente de la qualité, décide de laisser un commentaire");
                                                request({
                                                    url: `${customer_ws}/feedbacks/`,
                                                    method: 'POST',
                                                    body: {mealId: order.meals[0].id, rating: 4, customerId: client.id, desc: "Super Mac first !"},
                                                    json: true
                                                }).then(function (resp) {
                                                    console.log("Jordan consulte les avis sur les plats de son restaurant");
                                                    request({
                                                        url: `${restaurant_url}/feedbacks/${restaurantId}`,
                                                        method: 'GET',
                                                        qs: {restaurantId: restaurantId}
                                                    }).then(function (res) {
                                                        console.log("Terry consulte les statistiques")
                                                        request({
                                                            url: `${restaurant_url}/statistics/`,
                                                            qs: {restaurantId: restaurantId}
                                                        }).then(function (res) {
                                                            console.log("Liste : " + res);
                                                        });
                                                    }).catch(err=>{
                                                        throw  err;
                                                    });
                                                });
                                            });
                                        });
                                    }).catch(err=>{
                                        console.log("Impossible de mettre à jour sa position : " , err);
                                    })
                                }).catch(function (err) {
                                    console.log("ERROR : " + err);
                                    process.exit(1)
                                });
                            });
                        }
                    }).catch(err => {
                        console.log("err", err);
                    });
                }

            });
        });
    });
});