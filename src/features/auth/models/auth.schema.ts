// Import necessary functions, interfaces, and modules
import { hash, compare } from 'bcryptjs'; // For password hashing and comparison
import { IAuthDocument } from '@auth/interfaces/auth.interface'; // User document interface
import { model, Model, Schema } from 'mongoose'; // Mongoose for MongoDB

// Number of salt rounds for password hashing
const SALT_ROUND = 10;

// Define the authentication schema using Mongoose Schema
const authSchema: Schema = new Schema(
  {
    username: { type: String }, // User's username
    uId: { type: String }, // User's unique ID
    email: { type: String }, // User's email
    password: { type: String }, // Hashed user password
    avatarColor: { type: String }, // User's chosen avatar color
    createdAt: { type: Date, default: Date.now }, // Date when the user's account was created
    passwordResetToken: { type: String, default: '' }, // Token for password reset
    passwordResetExpires: { type: Number }, // Expiration time for password reset token
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password; // Remove password from serialized data
        return ret;
      }
    }
  }
);

// Pre-save middleware to hash user password before saving to the database
authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await hash(this.password as string, SALT_ROUND); // Hash the password
  this.password = hashedPassword; // Store the hashed password in the document
  next(); // Proceed to save
});

// Define methods for comparing and hashing passwords within the schema
authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!; // Get hashed password from the document
  return compare(password, hashedPassword); // Compare the provided password with the hashed password
};

authSchema.methods.hashPassword = async function (password: string): Promise<string> {
  return hash(password, SALT_ROUND); // Hash the provided password
};

// Create the Mongoose model for the authentication schema
const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth'); // 'Auth' is the collection name

// Export the AuthModel for use in other parts of the application
export { AuthModel };
