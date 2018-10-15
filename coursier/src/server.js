'use strict';

const util = require('util');
let http = require('http');
let url = require('url');
let methods = require('./methods');
const { Kafka, logLevel } = require('kafkajs');
let mongoHelper = require("./mongo-helper");

mongoHelper.initialize(mongoHelper);


const kafka = new Kafka({
    logLevel: logLevel.INFO,
    brokers: ["127.0.0.1:9092"],
    connectionTimeout: 3000,
    clientId: 'coursier',
});
const getDeliverableOrders = kafka.consumer({ groupId: 'get_ordered_to_be_delivered' });
const finaliseOrder = kafka.consumer({ groupId: 'finalise_order' });
const deleteOrder = kafka.consumer({ groupId: 'order_delivered' });
const producer = kafka.producer();

const run = async () => {
    await producer.connect();
    await getDeliverableOrders.connect();
    await getDeliverableOrders.subscribe({topic:"get_ordered_to_be_delivered"});

    await deleteOrder.connect();
    await deleteOrder.subscribe({topic:"order_delivered"});
    await deleteOrder.run({
        eachMessage: async ({ topic, partition, message }) => {
            methods.deleteOrder(message.value.toString(),mongoHelper.db);
        }
    });

    await finaliseOrder.connect();
    await finaliseOrder.subscribe({topic:"finalise_order"});
    await getDeliverableOrders.run({
        eachMessage: async ({ topic, partition, message }) => {
            methods.getOrderedToBeDelivered(message.value.toString(),producer,mongoHelper.db);
        }
    });

    await finaliseOrder.run({
        eachMessage: async({topic, partition, message}) => {
            console.log(util.inspect(message.value.toString(), {showHidden: false, depth: null}));
            console.log((util.inspect(mongoHelper)));
            methods.addOrder(message.value.toString(),mongoHelper.db);
        }
    })


};

run().catch(e => console.error(`[example/consumer] ${e.message}`, e));

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log(`process.on ${type}`);
            console.error(e);
            await getDeliverableOrders.disconnect();
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
});

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            await getDeliverableOrders.disconnect();
            await producer.disconnect();
        } finally {
            process.kill(process.pid, type)
        }
    })
});

/*let routes = {
    '/eta': function (body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                throw new (`RPC request was expecting some data`);
            }
            let _json = JSON.parse(body); // might throw error
            let keys = Object.keys(_json);
            let promiseArr = [];

            for (let key of keys) {
                if (methods[key] && typeof (methods[key].exec) === 'function') {
                    let execPromise = methods[key].exec.call(null, _json[key]);
                    if (!(execPromise instanceof Promise)) {
                        throw new Error(`exec on ${key} did not return a promise`);
                    }
                    promiseArr.push(execPromise);
                } else {
                    let execPromise = Promise.resolve({
                        error: 'method not defined'
                    });
                    promiseArr.push(execPromise);
                }
            }

            Promise.all(promiseArr).then(iter => {
                console.log(iter);
                let response = {};
                iter.forEach((val, index) => {
                    response[keys[index]] = val;
                });

                resolve(response);
            }).catch(err => {
                reject(err);
            });
        });
    }
};

function requestListener(request, response) {
    let reqUrl = `http://${request.headers.host}${request.url}`;
    let parseUrl = url.parse(reqUrl, true);
    let pathname = parseUrl.pathname;
    response.setHeader('Content-Type', 'application/json');
    let buf = null;
    request.on('data', data => {
        if (buf === null) {
            buf = data;
        } else {
            buf = buf + data;
        }
    });
    request.on('end', () => {
        let body = buf !== null ? buf.toString() : null;

        if (routes[pathname]) {
            let compute = routes[pathname].call(null, body);

            if (!(compute instanceof Promise)) {
                response.statusCode = 500;
                response.end('Server error');
                console.warn(`Not a Promise`);
            } else {
                compute.then(res => {
                    response.end(JSON.stringify(res))
                }).catch(err => {
                    console.error(err);
                    response.statusCode = 500;
                    response.end('Server error');
                });
            }

        } else {
            response.statusCode = 404;
            response.end(`${pathname} not found here`)
        }
    })
}

server.listen(PORT);*/