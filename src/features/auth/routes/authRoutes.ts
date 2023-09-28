// Import necessary modules and dependencies
import { Password } from '@auth/controllers/password';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { SignUp } from '@auth/controllers/signup';
import express, { Router } from 'express';

// Define the AuthRoutes class
class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  // Setup authentication routes
  public routes(): Router {
    console.log("hiiiii231wrwerwwt41")
    // Attach the create method from the SignUp class to the POST /signup route
    this.router.post('/signup', SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.read);
    this.router.post('/forgot-password', Password.prototype.create);
    this.router.post('/reset-password/:token', Password.prototype.update);



    return this.router;
  }
  public signoutRoutes(): Router {

    this.router.post('/signout', SignOut.prototype.update);


    return this.router;
  }
}

// Create an instance of AuthRoutes to export
export const authRoutes: AuthRoutes = new AuthRoutes();
