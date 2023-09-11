import { ServerError } from './../../globals/helpers/error-handler';
import { IUserDocument } from "@user/interfaces/user.interface";
import { BaseCache } from "./base.cache";

import Logger from 'bunyan';
import { config } from '@root/config';
import { Helpers } from '@global/helpers/helpers';

const log: Logger= config.createLogger('userCache');


export class UserCache extends BaseCache{
  constructor(){
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void>{
    const createdAt = new Date();
    const {
      _id,
      authId,
      username,
      email,
      password,
      avatarColor,
      uId,
      postsCount,
      work,
      school,
      quote,
      location,
      blocked,
      blockedBy,
      followersCount,
      followingCount,
      notifications,
      social,
      bgImageVersion,
      bgImageId,
      profilePicture
    } = createdUser;

    const dataToSave : string[] =[
      `_id`,
      `${_id}`,
      `authId`,
      `${authId}`,
      `username`,
      `${username}`,
      `email`,
      `${email}`,
      `password`,
      `${password}`,
      `avatarColor`,
      `${avatarColor}`,
      `uId`,
      `${uId}`,
      `postsCount`,
      `${postsCount}`,
      `work`,
      `${work}`,
      `school`,
      `${school}`,
      `quote`,
      `${quote}`,
      `location`,
      `${location}`,
      `blocked`,
      JSON.stringify(blocked),
      `blockedBy`,
      JSON.stringify(blockedBy),
      `followersCount`,
      `${followersCount}`,
      `followingCount`,
      `${followingCount}`,
      `notifications`,
      JSON.stringify(notifications),
      `social`,
      JSON.stringify(social),
      `bgImageVersion`,
      `${bgImageVersion}`,
      `bgImageId`,
      `${bgImageId}`,
      `profilePicture`,
      `${profilePicture}`,
      `createdAt`,
      `${createdAt}`

    ];

    try {
      if (!this.client.isOpen){
        await this.client.connect();
      }

      await this.client.ZADD('user', {score: parseInt(userUId,10), value: `${key}`});
      for (let i = 0; i < dataToSave.length; i += 2) {
        const field = dataToSave[i];
        const value = dataToSave[i + 1];
        await this.client.hSet(`users:${key}`, field, value);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, Try Again');
    }
  }


  public async getUserFromCache(userId:string): Promise <IUserDocument | null> {
    try {
      if (!this.client.isOpen){
        await this.client.connect();
      }

      const response : IUserDocument = await this.client.HGETALL(`users:${userId}`) as unknown as IUserDocument;
      console.log('response,userId', response,`user:${userId}`);
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(`${response.social}`);
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, Try Again');
    }
  }
}
