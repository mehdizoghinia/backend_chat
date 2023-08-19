import { config } from './config';
import express , {Express} from 'express';
import { chatServer } from './setupServer';
import databaseConnection from './setupDatabase';

class Application{
    public initialize() : void{
        this.loadConfig();
        databaseConnection();
        const app : Express = express();
        const server: chatServer= new chatServer(app);
        server.start();
    }
    private loadConfig(): void{
        config.validateConfig();
    }
}

const application : Application = new Application();
application.initialize();

