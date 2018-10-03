'use strict';

let types = {
    meal: {
        description:'a meal ordered by a client',
        props: {

            name: ['string', 'required'],
            price: ['number', 'required'],
            id: ['number', 'required'],
            eta: ['number', 'required'],
            category: ['string', 'required']
        }
    },
    order: {
        description:'the order containing the ordered meals',
        props: {
            id: ['number', 'required'],
            client: ['number', 'required'],
            meals: ['list', 'required']
        }
    }
};

module.exports = types;