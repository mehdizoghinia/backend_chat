// Import necessary types
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@user/interfaces/user.interface';

// Extend the Express Request interface globally
declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

// Define the structure of the authentication payload
export interface AuthPayload {
  userId: string;
  uId: string;
  email: string;
  username: string;
  avatarColor: string;
  iat?: number; // Optional property for issued at timestamp
}

// Define the structure of a document representing an authenticated user
export interface IAuthDocument extends Document {
  _id: string | ObjectId; // User's unique identifier
  uId: string; // User's unique ID
  username: string; // User's username
  email: string; // User's email
  password?: string; // User's hashed password (optional)
  avatarColor: string; // User's chosen avatar color
  createdAt: Date; // Date when the user's account was created
  passwordResetToken?: string; // Token for password reset (optional)
  passwordResetExpires?: number | string; // Expiration time for password reset token (optional)

  // Method to compare provided password with stored hashed password
  comparePassword(password: string): Promise<boolean>;

  // Method to hash a provided password
  hashPassword(password: string): Promise<string>;
}

// Define the structure of data used during user signup
export interface ISignUpData {
  _id: ObjectId; // User's unique identifier
  uId: string; // User's unique ID
  email: string; // User's email
  username: string; // User's username
  password: string; // User's password
  avatarColor: string; // User's chosen avatar color
}

// Define the structure of a job related to user authentication
export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument; // Either a string or an IAuthDocument instance
}
