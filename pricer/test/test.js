const methods = require('../src/methods');


jest.mock('../src/helper');
let helper = require('../src/helper');


beforeEach(() => {
    jest.resetModules();
    helper.send_price_computed = jest.fn();
    helper.findVoucherByCodeRestaurant = jest.fn(function (db, restaurantId, code) {
        return new Promise((resolve, reject) => {
            vouchers = [{
                restaurantId: 45,
                code: "normal",
                discount: 0.20,
                neededCategories: []
            }, {
                restaurantId: 45,
                code: "menu",
                discount: 0.30,
                neededCategories: ["main_course", "dessert"]
            },];
            for (const v of vouchers) {
                if (restaurantId === v.restaurantId && code === v.code) {
                    resolve(v);
                    return;
                }
            }
            resolve(null)
        })
    });
});

test('no price sends nothing', () => {
    methods.createOrder({meals: [{restaurant: {id: 45}}]}, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(0);
});

test('normal price works', () => {
    let lasagna = {restaurant: {id: 45}, price: 20.5};
    let steak = {restaurant: {id: 45}, price: 10};
    methods.createOrder({orderId: "212", requestId: "id", meals: [lasagna, steak]}, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(1);
    expect(helper.send_price_computed).toBeCalledWith(null, {orderId: "212", price: 30.5, requestId: "id"});
});

test('normal voucher', async () => {
    let lasagna = {restaurant: {id: 45}, price: 20};
    let steak = {restaurant: {id: 45}, price: 10};
    await methods.createOrder({
        orderId: "212",
        requestId: "id",
        meals: [lasagna, steak],
        voucher: "normal"
    }, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(1);
    expect(helper.send_price_computed).toBeCalledWith(null, {orderId: "212", price: 24, requestId: "id"});
});

test('menu voucher', async () => {
    let lasagna = {restaurant: {id: 45}, type: "main_course", price: 20};
    let steak = {restaurant: {id: 45}, price: 10, type: "main_course"};
    let tiramisu = {restaurant: {id: 45}, price: 5, type: "dessert"};
    await methods.createOrder({
        orderId: "212",
        requestId: "id",
        meals: [lasagna, steak, tiramisu],
        voucher: "menu"
    }, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(1);
    expect(helper.send_price_computed).toBeCalledWith(null, {orderId: "212", price: 24.5, requestId: "id"});
});

test('menu without enough types voucher', async () => {
    let salad = {restaurant: {id: 45}, type: "starter", price: 10};
    let tiramisu = {restaurant: {id: 45}, price: 5, type: "dessert"};
    await methods.createOrder({
        orderId: "212",
        requestId: "id",
        meals: [salad, tiramisu],
        voucher: "menu"
    }, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(1);
    expect(helper.send_price_computed).toBeCalledWith(null, {orderId: "212", price: 15, requestId: "id"});
});

test('unknown voucher', async () => {
    let lasagna = {restaurant: {id: 45}, type: "main_course", price: 20};
    let steak = {restaurant: {id: 45}, price: 10, type: "main_course"};
    let tiramisu = {restaurant: {id: 45}, price: 5, type: "dessert"};
    await methods.createOrder({
        orderId: "212",
        requestId: "id",
        meals: [lasagna, steak, tiramisu],
        voucher: "menu0"
    }, null, null);
    expect(helper.send_price_computed).toBeCalledTimes(1);
    expect(helper.send_price_computed).toBeCalledWith(null, {orderId: "212", price: 35, requestId: "id"});
});
