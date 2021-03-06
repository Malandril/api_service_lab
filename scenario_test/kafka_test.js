const request = require("request-promise");
const assert = require("assert");

let customer_ws = "http://localhost:8097";
let restaurant_url = "http://localhost:8098";
let coursier_url = "http://localhost:8099";


// assumption: the client is already connected
var client = {id: 23, address: "742 Evergreen Terrace", name: "Homer", phone: "0608724762"};
var order = null;
var coursierId = "18";
var jimmyId = "19";
var orderId = null;
var restaurantId = "12";
const mycode = "mycode";
let realPrice = null;

async function test() {

    await request({
        url: `${restaurant_url}/vouchers/`,
        method: 'POST',
        body: {
            restaurantId: restaurantId,
            code: mycode,
            discount: 0.2,
            expirationDate: new Date(),
            neededCategories: ["burger", "dessert"]
        },
        json: true
    });
    let vouchers = JSON.parse(await request({url: `${restaurant_url}/vouchers/${restaurantId}`}));
    assert(vouchers.vouchers[0].code === mycode);

    request({url: `${customer_ws}/meals`, qs: {category: ["burger"]}}).then(function (meals) {
        let parse = JSON.parse(meals);
        let data = [parse.meals[0], parse.meals[2]];
        restaurantId = parse.meals[0].restaurant.id;
        realPrice = parse.meals[0].price + parse.meals[2].price;
        console.log("Meals returned");
        order = {
            meals: data,
            customer: {
                name: "Bob",
                address: "3 Privet Drive",
            },
            voucher: "mycode"
        };
        request({
            url: `${customer_ws}/orders/`,
            method: 'POST',
            body: order,
            json: true
        }).then(function (resp) {
            console.log("La commande de GAIL devrait être prête dans  ", resp.eta, " minutes, price:", resp.price);
            assert(resp.price === realPrice * 0.8);
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
                    qs: {id: restaurantId, status: "todo"}
                }).then(function (res) {
                    const data = JSON.parse(res);
                    console.log("Le restaurateur liste les plats à préparer :");
                    var commandFound = false;
                    data.orders.forEach(o => {
                        console.log(o.orderId);
                        if (o.orderId === orderId && o.status === "todo") {
                            commandFound = true;
                        }
                    });
                    if (!commandFound) {
                        console.log("Le restaurateur ne trouve pas la commande de Gail oO");
                        process.exit(1);
                    } else {
                        console.log("Jimmy liste les commandes proches");
                        request({
                            url: `${coursier_url}/deliveries`,
                            qs: {id: coursierId, address: "3 Rue principale"}
                        }).then(function (res) {
                            var commandFound = false;
                            var data = JSON.parse(res);
                            data.orders.forEach(order => {
                                console.log(order.id);
                                if (order.id === orderId) {
                                    commandFound = true;
                                }
                            });
                            if (!commandFound) {
                                console.log("Jimmy ne trouve pas la commande");
                                process.exit(1);
                            } else {
                                console.log("Jimmy s'occupe de la commande " + orderId);
                                request({
                                    url: `${coursier_url}/deliveries`,
                                    method: 'POST',
                                    body: {orderId: orderId, coursierId: coursierId},
                                    json: true
                                }).then(function (res) {
                                    console.log("Sur le chemin, Jimmy décide de faire option AL en alternance et meurt dans d'atroces souffrances.");
                                    request({
                                        url: `${coursier_url}/deliveries/${orderId}`,
                                        method: 'DELETE',
                                        body: {orderId: orderId, coursierId: coursierId},
                                        json: true
                                    }).then(res => {
                                        console.log("Jamie liste les commandes proches");
                                        request({
                                            url: `${coursier_url}/deliveries`,
                                            qs: {id: coursierId, address: "3 Rue principale"}
                                        }).then(function (res) {
                                            var commandFound = false;
                                            var data = JSON.parse(res);
                                            data.orders.forEach(order => {
                                                console.log(order.id);
                                                if (order.id === orderId) {
                                                    commandFound = true;
                                                }
                                            });
                                            if (!commandFound) {
                                                console.log("Jamie ne trouve pas la commande");

                                            } else {
                                                console.log("Jamie s'occupe de la commande " + orderId);
                                                request({
                                                    url: `${coursier_url}/deliveries`,
                                                    method: 'POST',
                                                    body: {orderId: orderId, coursierId: coursierId},
                                                    json: true
                                                }).then(function (res) {
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
                                                            body: {
                                                                orderId: orderId,
                                                                coursierId: coursierId,
                                                                timestamp: Math.round((Date.now()) / 1000),
                                                                geolocation: {long: 12, lat: 42}
                                                            },
                                                            json: true
                                                        }).then(function (res) {
                                                            console.log("Gail traque Jamie");
                                                            request({
                                                                url: `${customer_ws}/geolocation/${orderId}`,
                                                                method: 'GET',
                                                                qs: {orderId: orderId, lat: 19, long: 42}
                                                            }).then(function (res) {
                                                                console.log("new res", res);
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
                                                                        body: {
                                                                            mealId: order.meals[0].id,
                                                                            rating: 4,
                                                                            customerId: client.id,
                                                                            desc: "Super Mac first !"
                                                                        },
                                                                        json: true
                                                                    }).then(async function (resp) {
                                                                        let res = await request({
                                                                            url: `${restaurant_url}/orders/`,
                                                                            qs: {id: restaurantId, status: "delivered"}
                                                                        });
                                                                        const data = JSON.parse(res);
                                                                        console.log("Le restaurateur liste les commandes qui ont été livrées :");
                                                                        var commandFound = false;
                                                                        data.orders.forEach(o => {
                                                                            console.log(o.orderId);
                                                                            if (o.orderId === orderId && o.status === "delivered") {
                                                                                commandFound = true;
                                                                            }
                                                                        });
                                                                        if (!commandFound) {
                                                                            console.log("Le restaurateur ne trouve pas que la commande de Gail a été livrée");
                                                                            process.exit(1);
                                                                        } else {
                                                                            console.log("Jordan consulte les avis sur les plats de son restaurant");
                                                                            request({
                                                                                url: `${restaurant_url}/feedbacks/${restaurantId}`,
                                                                                method: 'GET',
                                                                                qs: {restaurantId: restaurantId}
                                                                            }).then(function (res) {
                                                                                res = JSON.parse(res);
                                                                                console.log(res.meals.map(value => value.feedbacks));
                                                                                console.log("Terry consulte les statistiques de son restaurant");
                                                                                request({
                                                                                    url: `${restaurant_url}/statistics/${restaurantId}`,
                                                                                    qs: {restaurantId: restaurantId}
                                                                                }).then(function (res) {
                                                                                    console.log("Liste : " + res);
                                                                                });
                                                                            }).catch(err => {
                                                                                throw  err;
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        }).catch(err => {
                                                            console.log("Impossible de mettre à jour sa position : ", err);
                                                            process.exit(1)
                                                        })
                                                    }).catch(function (err) {
                                                        console.log("ERROR : " + err);
                                                        process.exit(1)
                                                    });
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        }).catch(err => {
                            console.log("err", err);
                            process.exit(1)
                        });
                    }

                });
            });
        });
    }).catch(reason => {
            console.log("err", reason);
            process.exit(1)
        }
    );
}

test();