import { authService } from '@services/db/auth.service';
import { config } from "@root/config";
import { DoneCallback, Job } from "bull";
import Logger from "bunyan";
import mail from '@sendgrid/mail';
import { mailTransport } from '@services/emails/mail.transport';


const log: Logger= config.createLogger('emailWorker');

class EmailWorker {
  async addEmailNotification(job: Job, done: DoneCallback): Promise<void>{
    try {
      const {template, receiverEmail, subject} = job.data;
      await mailTransport.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker :   EmailWorker = new EmailWorker();
