import express, { Router } from 'express';
import { authMiddleWare } from '@global/helpers/auth.middleware';
import { Create } from '@post/controllers/create-post';
import { Get } from '@post/controllers/get-post';


class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleWare.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleWare.checkAuthentication, Get.prototype.postsWithImages);

    this.router.post('/post', authMiddleWare.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleWare.checkAuthentication, Create.prototype.postWithImage);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
