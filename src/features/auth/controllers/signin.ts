// Import necessary modules and dependencies
import HTTP_STATUS from "http-status-codes";
import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi_validation.decorator';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IResetPasswordParams, IUserDocument } from "@user/interfaces/user.interface";
import { userService } from "@services/db/user.service";
import { mailTransport } from "@services/emails/mail.transport";
import { forgotPasswordTemplate } from "@services/emails/templates/forgot-password/forgot-pw-templ";
import { emailQueue } from "@services/queues/email.queue";

import moment from "moment";
import publicIP from 'ip';
import { resetPasswordTemplate } from "@services/emails/templates/reset-password/reset-pw-templ";

// Define a class called SignIn
export class SignIn {
  // Use the joiValidation decorator to validate the request body against the loginSchema
  @joiValidation(loginSchema)
  // Define an asynchronous method called 'read' to handle user sign-in
  public async read(req: Request, res: Response): Promise<void> {
    // Extract 'username' and 'password' from the request body
    const { username, password } = req.body;

    // Check if a user with the same 'username' exists in the authentication service
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      // If no user is found, throw a BadRequestError with a message
      throw new BadRequestError('Invalid credentials');
    }

    // Compare the provided 'password' with the stored password for the user
    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      // If passwords don't match, throw a BadRequestError with a message
      throw new BadRequestError('Password does not match');
    }

    // Retrieve additional user information from the user service based on the 'authId'
    console.log(`idddd${existingUser._id}`);
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    console.log('useerrr:', user);
    // Generate a JSON Web Token (JWT) for the user
    const userJWT: string = JWT.sign({
      userId: user._id,
      uId: existingUser.uId,
      email: existingUser.email,
      username: existingUser.username,
      avatarColor: existingUser.avatarColor
    },
    config.JWT_TOKEN!
    );

    // Create a userDocument object with selected fields from the user and existingUser objects
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;

    // Set the JWT token in the session
    req.session = { jwt: userJWT };

    // await mailTransport.sendEmail('enola.bosco@ethereal.email',"this is subject", 'this is body');

    ///test reset-password
    // const resetLink = `${config.CLIENT_URL}/reset-password?token=1234234`;
    // const template : string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    // emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail:'enola.bosco@ethereal.email',subject:'Please reset your password'});

    ///test confirmation
    // const templateParams: IResetPasswordParams = {
    //   username: existingUser.username!,
    //   email: existingUser.email!,
    //   ipaddress: publicIP.address(),
    //   date: moment().format('DD/MM/YYYY HH:mm')
    // }
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail:'enola.bosco@ethereal.email',subject:'password reset confirmation'} );
    // Send a JSON response indicating successful user login along with user information and the JWT token
    res.status(HTTP_STATUS.OK).json({ message: 'User logged in', user: userDocument, token: userJWT });
  }
}
