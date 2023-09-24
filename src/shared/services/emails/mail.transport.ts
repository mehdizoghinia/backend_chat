// Import necessary packages and modules
import nodemailer, { Transporter } from 'nodemailer';
import sendGridMail from '@sendgrid/mail';
import Logger from 'bunyan';
import { config } from '@root/config';
import { BadRequestError } from '@global/helpers/error-handler';

// Define an interface for email options
interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Create a logger instance using Bunyan
const log: Logger = config.createLogger('mailOptions');

// Set the SendGrid API key from the project's configuration
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

// Define a class for email transportation
class MailTransport {
  // Method for sending emails
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    // Determine the environment and choose the appropriate email sender
    // console.log('receiverEmail, subject, body', receiverEmail, subject, body)
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      await this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      await this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  // Method for sending emails in development and testing environments
  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    // Create a Nodemailer transporter for sending emails
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!,
      },
    });


    // Define email options
    const mailOptions: IMailOptions = {
      from: `chat app <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };
    console.log("from to",config.SENDER_EMAIL! ,receiverEmail)
    try {
      // Send the email using Nodemailer
      await transporter.sendMail(mailOptions);
      log.info('Development email sent');
    } catch (error) {
      log.error('Error sending development email', error);
      throw new BadRequestError('Error sending development email');
    }
  }

  // Method for sending emails in production environment using SendGrid
  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    // Define email options
    const mailOptions: IMailOptions = {
      from: `chat app <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    try {
      // Send the email using SendGrid
      await sendGridMail.send(mailOptions);
      log.info('Production email sent');
    } catch (error) {
      log.error('Error sending production email', error);
      throw new BadRequestError('Error sending production email');
    }
  }
}

// Export the MailTransport class for use in other modules
export const mailTransport: MailTransport = new MailTransport();
