// Import necessary modules and dependencies
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
    // Attach the create method from the SignUp class to the POST /signup route
    this.router.post('/signup', SignUp.prototype.create);

    this.router.post('/signin', SignIn.prototype.read);

    return this.router;
  }
  public signoutRoutes(): Router {

    this.router.post('/signout', SignOut.prototype.update);


    return this.router;
  }
}

// Create an instance of AuthRoutes to export
export const authRoutes: AuthRoutes = new AuthRoutes();
