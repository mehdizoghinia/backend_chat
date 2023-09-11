// Import necessary modules and types
import { IUserDocument } from "@user/interfaces/user.interface";
import { UserModel } from "@user/models/user.schema";
import mongoose from "mongoose";

// Define a class called UserService
class UserService {
  // Define a method for adding user data to the database
  public async addUserData(data: IUserDocument): Promise<void> {
    // Use the UserModel to create a new user document in the database
    await UserModel.create(data);
  }

  public async getUserById(userId: string): Promise<IUserDocument>{
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: {_id: new mongoose.Types.ObjectId(userId)}},
      { $lookup: {from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId'}},
      { $unwind: '$authId'},
      { $project: this.aggregateProject()}
    ]);
    return users[0];
  }

  private aggregateProject(){
    return{
      _id : 1,
      username: '$authId.username',
      uId: '$authId.uId',
      email: '$authId.email',
      avatarColor: '$authId.avatarColor',
      createdAt: '$authId.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1

    }
  }

  // Define a method for retrieving a user by their authentication ID
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    // Use aggregation to perform a complex query on the UserModel
    const users: IUserDocument[] = await UserModel.aggregate([
      // Stage 1: Match documents where the 'authId' field matches the given 'authId'
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },

      // Stage 2: Perform a left outer join with the 'Auth' collection using 'authId' as the link
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },

      // Stage 3: Unwind the 'authId' array created by the $lookup stage
      { $unwind: '$authId' }
      // Stage 4 (commented out): You can add additional stages here if needed
    ]);

    // Return the first user document found (if any)
    return users[0];
  }
}

// Export an instance of the UserService class
export const userService: UserService = new UserService();
