import { config } from '@root/config';
import express , {Express} from 'express';
import { chatServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';

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
        config.cloudinaryConfig();
    }
}

const application : Application = new Application();
application.initialize();

