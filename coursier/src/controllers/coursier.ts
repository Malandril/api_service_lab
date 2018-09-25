import { Request, Response } from "express";
import { Customer } from "../../../commons/models/Customer";
class OrderCreation {
    id: number;
    customer: Customer;
    constructor(id: number, customer: Customer) {
        this.id = id;
        this.customer = customer as Customer;

    }
    public static isOrderCreation(obj: any) {
        const errors: string[] = [];
        if (!("id" in obj ) ) {
            errors.push("'id' needed.");
        }
        if (! ("customer" in obj)) {
            console.log("customer needed");
        }
        return (errors.length === 0 ? true : errors);
    }
}
let orders: OrderCreation[] = []; // identified order
let size = 0;

orders = [];
export let notifyOrder = (req: Request, res: Response) => {
    const orderCreation = OrderCreation.isOrderCreation(req.body);
    if (orderCreation !== true) {
       const errors: string[] = orderCreation as string[];
       let result: string = "";
        for (let i = 0; i < errors.length; i++) {
            result += errors[i];
        }
        res.statusCode = 412;
        res.send(result);
    } else {
        const request: OrderCreation = req.body as OrderCreation;
        console.log("Adding " + JSON.stringify(request));
        for (const property in request ) {
            console.log("has property " + property );
        }
        orders.push(request);
        size++;
        res.json([{orderId: size}]);
    }
};


export let getContact = (req: Request, res: Response) => {
    res.json([{name: "hello world", type: "waow", id: 1}]);
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
export let postContact = (req: Request, res: Response) => {
    req.assert("name", "Name cannot be blank").notEmpty();
    req.assert("message", "Message cannot be blank").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.redirect("/contact");
    }

    const mailOptions = {
        to: "your@email.com",
        from: `${req.body.name} <${req.body.email}>`,
        subject: "Contact Form",
        text: req.body.message
    };
};
