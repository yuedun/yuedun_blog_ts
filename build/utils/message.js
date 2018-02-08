"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer = require("nodemailer");
var Promise = require("bluebird");
var settings_1 = require("../settings");
var debug = require('debug')('yuedun:message');
var Message = (function () {
    function Message(mailTo, subject, html, text) {
        this.mailTo = mailTo;
        this.subject = subject;
        this.text = text;
        this.content = html;
    }
    Message.prototype.send = function () {
        var transporter = nodemailer.createTransport({
            service: '163',
            auth: {
                user: settings_1.mail.from,
                pass: settings_1.mail.pass
            }
        });
        var mailOptions = {
            from: settings_1.mail.from,
            to: this.mailTo,
            subject: this.subject,
            text: this.text,
            html: this.content
        };
        return new Promise(function (resolve, reject) {
            transporter.verify(function (error, success) {
                if (error) {
                    reject(error);
                }
                else {
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(info);
                        }
                    });
                }
            });
        });
    };
    return Message;
}());
exports.default = Message;
//# sourceMappingURL=message.js.map