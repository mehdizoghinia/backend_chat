import  HTTP_STATUS  from 'http-status-codes';
import { Request, Response } from "express";
import { UserCache } from "@services/redis/user.cache";
import { IUserDocument } from "@user/interfaces/user.interface";
import { userService } from "@services/db/user.service";

const userCache: UserCache = new UserCache();

export class CurrentUser{
  public async read(req: Request, res: Response): Promise<void>{
    let isUser = false;
    let token = null;
    let user = null;
    console.log('currentUseruserId', req.currentUser?.userId);

    const cachedUser: IUserDocument = await userCache.getUserFromCache(`${req.currentUser!.userId}`) as IUserDocument;
    // console.log('cachedUser', cachedUser);
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);

    if (Object.keys(existingUser).length){
      isUser = true;
      token = req.session?.jwt;
      user= existingUser;
    }
    res.status(HTTP_STATUS.OK).json({token, user, isUser});
  }
}
