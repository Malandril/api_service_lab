import { Request, Response } from "express";

/**
 * GET /contact
 * Contact form page.
 */
export let getContact = (req: Request, res: Response) => {

    res.json([{name: "hello 77", type: "waow", id: 1}]);
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
