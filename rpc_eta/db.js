'use strict';

let etas = {};

let db = {
    etas: proc(etas)
};

function proc(container) {
    return {
        getETA(mealObj){
            return 42;
        }
    }
}

module.exports = db;