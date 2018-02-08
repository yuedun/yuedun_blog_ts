import * as nodemailer from 'nodemailer';
import * as Promise from 'bluebird';
import { mail } from '../settings';
var debug = require('debug')('yuedun:message');

export default class Message {
    mailTo: string;
    subject: string;
    text: string;
    content: string;
    /**
     * Creates an instance of Message.
     * @param {string} mailTo 
     * @param {string} subject 
     * @param {string} [html] html版本的内容
     * @param {string} [text] 普通文本版本的内容
     * @memberof Message
     */
    constructor(mailTo: string, subject: string, html: string, text: string) {
        this.mailTo = mailTo;
        this.subject = subject;
        this.text = text;
        this.content = html;
    }

    send() {
        // create reusable transporter object using the default SMTP transport 
        var transporter = nodemailer.createTransport({
            service: '163',
            // host: 'smtp.gmail.com',
            // port: 465,
            // secure: true, // use SSL 
            auth: {
                user: mail.from,
                pass: mail.pass
            }
        });

        // setup e-mail data with unicode symbols 
        var mailOptions = {
            from: mail.from, // sender address 
            to: this.mailTo, // list of receivers 'hale.huo@zhangmen.com'
            subject: this.subject, // Subject line 
            text: this.text, // plaintext body 
            html: this.content// html body 
        };
        return new Promise((resolve, reject) => {
            transporter.verify(function (error: any, success: any) {
                if (error) {
                    reject(error);
                } else {
                    // send mail with defined transport object 
                    transporter.sendMail(mailOptions, function (error: any, info: any) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(info);
                        }
                    });
                }
            });
        })
    }
}