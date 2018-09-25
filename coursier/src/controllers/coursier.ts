import { Request, Response } from "express";

declare var orders: {id: number, req: Request}[]; // identified order
declare var size: number;
size = 0;

/**
 * GET /contact
 * Contact form page.
 */



export let notifyOrder = (req: Request, res: Response) => {
    req.assert("creation", "Creation timestamp cannot be empty").notEmpty();
    size++;
    orders.push({id: size, req: req });
    res.json([{orderId: size}]);
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
