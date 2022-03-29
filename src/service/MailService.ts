import { MailOptions } from 'nodemailer/lib/smtp-pool';
import * as Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';

export abstract class MailService {
  static async sendMail(mailOptions: MailOptions, transporter: Mail) {
    if (mailOptions) {
      let info = await transporter.sendMail(mailOptions);
      if (info) {
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    }

    return;
  }
}
