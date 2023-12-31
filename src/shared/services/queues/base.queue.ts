import Queue , {Job} from 'bull';
import {createBullBoard} from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

import Logger from 'bunyan';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob } from '@user/interfaces/user.interface';
import { IPostJobData } from '@post/interfaces/post.interface';

type IBaseJobData = IAuthJob | IEmailJob | IPostJobData;

let bullAdapters : BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {

  queue: Queue.Queue;
  log: Logger;
  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    //delete duplicates
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.log = config.createLogger(`${queueName} queue`);

    this.queue.on('completed', (job: Job) =>{
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string)=>{
      this.log.info(`job ${jobId} completed`);
    });

    this.queue.on('stalled', (jobId: string)=>{
      this.log.info(`job ${jobId} stalled`);
    });

  }

  protected addJob(name: string, data: IBaseJobData): void{
    this.queue.add(name, data, {attempts: 3, backoff:{type:'fixed', delay:5000}});
  }

  protected processJobs(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void{
    this.queue.process(name, concurrency, callback);
  }
}
