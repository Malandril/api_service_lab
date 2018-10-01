import { Request, Response, Router } from "express";
import { CustomerModel } from "../../models";

const {check, validationResult} = require("express-validator/check");

const router = Router();

const data: { [key: number]: CustomerModel; } = {
    0: new CustomerModel({"id": 0, "name": "Clara", "address": "4 Private Drive", "phone": "04.44.44.44"}),
};
let nextId = 1;

/**
 * GET /customers
 * Return the list of customers offered by Uberoo
 */
const getCustomers = (req: Request, res: Response) => {
    res.status(200).send(Object.keys(data).map(key => data[+key]));
};
router.get("/", getCustomers);

/**
 * GET /customers/:customerId
 * Return the specified customer
 */
const getCustomer = (req: Request, res: Response) => {
    const o = data[+req.params.customerId];
    if (o === undefined) {
        res.status(404);
    } else {
        res.status(200).send(o);
    }
};
router.get("/:customerId", getCustomer);

/**
 * POST /customers
 * Create the specified customer
 */
const postCustomer = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const o = new CustomerModel({"name": req.body.name, "address": req.body.address, "phone": "04.44.44.44", "id": nextId});
    data[nextId++] = o;
    res.status(201).json(o);
};

function getCustomerValidator() {
    return [
        check("name").isString().isLength({min: 1}).withMessage("A customer needs a name"),
        check("address").isString().isLength({min: 1}).withMessage("A customer needs an address"),
        check("phone").isString().isLength({min: 1}).withMessage("A customer needs an phone")
    ];
}

router.post("/", getCustomerValidator(), postCustomer);

/**
 * DELETE /customers/:customerId
 * Delete the specified customer
 */
const deleteCustomer = (req: Request, res: Response) => {
    const o = data[req.params.customerId];
    if (o === undefined) {
        res.status(404);
    } else {
        delete data[req.params.customerId];
        res.status(200).send(o);

    }
};
router.delete("/:customerId", deleteCustomer);

/**
 * PUT /customers/:customerId
 * Update the specified customer
 */
const putCustomer = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const o = data[+req.params.customerId];
    if (o === undefined) {
        res.status(404);
    } else {
        o.name = req.body.name;
        o.address = req.body.address;
        o.phone = req.body.phone;
        res.status(200).send(o);
    }
};
router.put("/:customerId", getCustomerValidator(), putCustomer);


export default router;