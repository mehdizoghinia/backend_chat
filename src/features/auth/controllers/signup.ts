// Import necessary modules and dependencies
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi_validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@services/redis/user.cache';
import {omit} from 'lodash';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

const userCache: UserCache= new UserCache();

// Define the SignUp class
export class SignUp {
  // Apply validation using the joiValidation decorator with signupSchema
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    // Extract user signup data from the request body
    const { username, password, email, avatarColor, avatarImage } = req.body;

    // Check if a user with the same username or email exists
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate unique IDs and uId
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntWithLength(12)}`;

    // Create authentication data for the new user
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,
    });

    // // Upload the user's avatar image to a cloud service (e.g., Cloudinary)
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('Error uploading file. Please try again');
    }

    // //add to redis cache
    const userDataforCache : IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataforCache.profilePicture = `https://res.cloudinary.com/dypjirnzm/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataforCache);

    // // Add to database
    omit(userDataforCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    console.log(userDataforCache);
    authQueue.addAuthUserJob('addAuthUserToDB', {value: authData});
    userQueue.addUserJob('addUserToDB', {value: userDataforCache});

    // add data to the session
    const userJWT :string = SignUp.prototype.signToken(authData, userObjectId );
    req.session = {jwt: userJWT};


    // Respond with a success message and the user's authentication data
    res.status(HTTP_STATUS.CREATED).json({ message: 'User created', user: userDataforCache, token: userJWT });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string{
    return JWT.sign({
      userId: userObjectId,
      uId: data.uId,
      email: data.email,
      username: data.username,
      avatarColor: data.avatarColor
    },
    config.JWT_TOKEN!
    )
  }

  // Private method to structure user signup data
  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLEtterUpperCase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date(),
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument{
    const { _id, username, email,uId, password, avatarColor }= data;
    return{
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLEtterUpperCase(username),
      email,
      password,
      avatarColor,
      profilePicture:'',
      blocked: [],
      blockedBy: [],
      work: '',
      location:'',
      school:'',
      quote:'',
      bgImageVersion:'',
      bgImageId:'',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications:{
        messages:true,
        reactions:true,
        comments: true,
        follows: true
      },
      social:{
        facebook:'',
        instagram:'',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
