"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
size = 0;
/**
 * GET /contact
 * Contact form page.
 */
exports.notifyOrder = function (req, res) {
    req.assert("creation", "Creation timestamp cannot be empty").notEmpty();
    size++;
    orders.push({ id: size, req: req });
    res.json([{ orderId: size }]);
};
exports.getContact = function (req, res) {
    res.json([{ name: "hello world", type: "waow", id: 1 }]);
};
/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = function (req, res) {
    req.assert("name", "Name cannot be blank").notEmpty();
    req.assert("message", "Message cannot be blank").notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.redirect("/contact");
    }
    var mailOptions = {
        to: "your@email.com",
        from: req.body.name + " <" + req.body.email + ">",
        subject: "Contact Form",
        text: req.body.message
    };
};
