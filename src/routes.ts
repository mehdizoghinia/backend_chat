import { authRoutes } from "@auth/routes/authRoutes";
import { currentUserRoutes } from "@auth/routes/currentRoutes";
import { authMiddleWare } from "@global/helpers/auth.middleware";
import { postRoutes } from "@post/routes/postRoutes";
import { serverAdapter } from "@services/queues/base.queue";
import { Application } from "express";

const BASE_PATH = '/api/v1';

export default (app : Application) => {
    const routes = () =>{
      app.use('/queues', serverAdapter.getRouter());
      app.use(BASE_PATH, authRoutes.routes());
      app.use(BASE_PATH, authRoutes.signoutRoutes());

      app.use(BASE_PATH, authMiddleWare.verifyUser ,currentUserRoutes.routes());
      app.use(BASE_PATH, authMiddleWare.verifyUser ,postRoutes.routes());

    };
    routes();
}
