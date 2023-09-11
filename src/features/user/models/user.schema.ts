// Import necessary modules and interfaces.
import mongoose, { Model, Schema } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';

// Define a user schema using Mongoose Schema.
const userSchema: Schema = new Schema({
  // User authentication ID, references 'Auth' model.
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },

  // User profile picture URL, default is an empty string.
  profilePicture: { type: String, default: '' },

  // Count of user posts, default is 0.
  postsCount: { type: Number, default: 0 },

  // Count of user followers, default is 0.
  followersCount: { type: Number, default: 0 },

  // Count of user followings, default is 0.
  followingCount: { type: Number, default: 0 },

  // Token for password reset, default is an empty string.
  passwordResetToken: { type: String, default: '' },

  // Timestamp for password reset expiration.
  passwordResetExpires: { type: Number },

  // List of users blocked by this user, references 'User' model.
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // List of users who blocked this user, references 'User' model.
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // User notification settings.
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true },
  },

  // User social media profiles.
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },

  // User work information, default is an empty string.
  work: { type: String, default: '' },

  // User school information, default is an empty string.
  school: { type: String, default: '' },

  // User location, default is an empty string.
  location: { type: String, default: '' },

  // User favorite quote, default is an empty string.
  quote: { type: String, default: '' },

  // Version of the user's background image, default is an empty string.
  bgImageVersion: { type: String, default: '' },

  // ID of the user's background image, default is an empty string.
  bgImageId: { type: String, default: '' },
});

// Create a Mongoose model for the user using the schema.
const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema, 'User');

// Export the UserModel for use in other parts of the application.
export { UserModel };
