// Import necessary modules and dependencies
import { CurrentUser } from '@auth/controllers/current-user';
import { authMiddleWare } from '@global/helpers/auth.middleware';
import express, { Router } from 'express';

// Define the AuthRoutes class
class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentuser' ,CurrentUser.prototype.read);
    return this.router;
  }

}

// Create an instance of AuthRoutes to export
export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
