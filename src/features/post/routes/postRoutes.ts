import express, { Router } from 'express';
import { authMiddleWare } from '@global/helpers/auth.middleware';
import { Create } from '@post/controllers/create-post';


class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    console.log("hiiiii23141")
    this.router.post('/post', authMiddleWare.checkAuthentication, Create.prototype.post);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
