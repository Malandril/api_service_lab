import {Request, Response, Router} from "express";
import {CustomerModel} from "../../models";
import {ICustomerModel} from "../../models/CustomerModel";

const {check, validationResult} = require("express-validator/check");

const router = Router();


/**
 * GET /customers
 * Return the list of customers offered by Uberoo
 */
const getCustomers = (req: Request, res: Response) => {
    CustomerModel.find().then((customers: ICustomerModel[]) => {
        res.status(200).json(customers);
    });

};
router.get("/", getCustomers);

/**
 * GET /customers/:customerId
 * Return the specified customer
 */
const getCustomer = (req: Request, res: Response) => {
    CustomerModel.findById(req.params.customerId).exec((err, customer) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!customer) {
            res.sendStatus(404);
            return;
        }
        console.log("GET: " + customer);
        res.status(200).json(customer);
    });
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
    const m = new CustomerModel();
    m.name = req.body.name;
    m.address = req.body.address;
    m.phone = req.body.phone;

    CustomerModel.create(m).then((customer) => {
        console.log("POST: " + customer);
        res.status(201).json(customer);
    });
};

function getCustomerValidator() {
    return [
        check("name").isString().isLength({min: 1}).withMessage("A customer needs a name"),
        check("address").isString().isLength({min: 1}).withMessage("A customer needs an address"),
        check("phone").isString().isLength({min: 1}).withMessage("A customer needs a phone"),
    ];
}

router.post("/", getCustomerValidator(), postCustomer);

/**
 * DELETE /customers/:customerId
 * Delete the specified customer
 */
const deleteCustomer = (req: Request, res: Response) => {
    CustomerModel.findByIdAndRemove(req.params.customerId).exec((err, customer) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!customer) {
            res.sendStatus(404);
            return;
        }
        console.log("DELETE: " + customer);
        res.status(200).json(customer);
    });
};
router.delete("/:customerId", deleteCustomer);

/**
 * PUT /customers/:customerId
 * Update the specified customer
 */
const putCustomer = (req: Request, res: Response) => {
    CustomerModel.findByIdAndUpdate(req.params.customerId, req.body).exec((err, customer) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if (!customer) {
            res.sendStatus(404);
            return;
        }
        console.log("PUT: " + customer);
        res.status(200).json(customer);
    });
};
router.put("/:customerId", getCustomerValidator(), putCustomer);


export default router;