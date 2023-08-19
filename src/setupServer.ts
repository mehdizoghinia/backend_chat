import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
import {Application, json, urlencoded, Response, Request, NextFunction, } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import compression from 'compression';

import {Server} from 'socket.io';
import { createClient } from "redis";
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from 'bunyan';

import 'express-async-errors';
import { config } from './config';

import applicationRoutes from './routes';



const SERVER_PORT = 5001;
const log : Logger = config.createLogger('server');

export class chatServer {
    private app: Application;

    constructor(app: Application){
        this.app = app;
    }

    public start() : void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }


    private securityMiddleware(app: Application): void {
        // Set up cookie session middleware for handling user sessions
        app.use(
            cookieSession({
                name: 'session',
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 3600000,
                secure: config.NODE_ENV !== 'development'
            })
        );

        // Apply helmet middleware for setting various HTTP security headers
        app.use(helmet());

        // Apply HTTP Parameter Pollution (HPP) protection middleware
        app.use(hpp());

        // Apply CORS middleware with specified configuration
        app.use(
            cors({
                origin: config.CLIENT_URL,
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            })
        );
    }

    private standardMiddleware(app: Application): void {
        // Apply compression middleware for response compression
        app.use(compression());

        // Apply JSON body parsing middleware with a specified limit
        app.use(json({ limit: 50 }));

        // Apply URL-encoded body parsing middleware with a specified limit and extended mode
        app.use(urlencoded({ extended: true, limit: 50 }));
    }


    private routesMiddleware(app: Application): void{
        applicationRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
    // Handle requests with URLs that are not matched by any route
    app.all('*', (req: Request, res: Response) => {
        // Respond with a "Not Found" status code and a JSON error message
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    // Handle errors that are thrown or explicitly passed through middleware
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
        // Log the error to the console for debugging
        log.error('errrrrror: ', error);

        // Check if the error is an instance of the CustomError class
        if (error instanceof CustomError) {
            // If it is, respond with the error's status code and a serialized error object
            return res.status(error.statusCode).json(error.serializeErrors());
        }

        // If the error is not an instance of CustomError, continue to the next middleware
        next();
    });
}


    private async startServer(app: Application): Promise<void>{
        try {
            const httpServer : http.Server = new http.Server(app);
            const socketIO : Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOconnections(socketIO);
        } catch (error) {
            log.error(error)
        }
    }

    private async createSocketIO(httpServer: http.Server): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            }
        });

        // Create and connect Redis pub and sub clients
        const pubClient = createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();

        // Connect to the Redis clients
        await Promise.all([pubClient.connect(), subClient.connect()]);

        // Configure the Socket.IO server to use the Redis pub-sub mechanism
        io.adapter(createAdapter(pubClient, subClient));

        return io; // Return the configured Socket.IO server
    }

    private startHttpServer(httpServer: http.Server): void{
        log.info(`server is running on ${process.pid}`)
        httpServer.listen(SERVER_PORT, () =>{
            log.info(`server is running on port ${SERVER_PORT}`)
        });
    }
    private socketIOconnections (io:Server): void{

    }
}
