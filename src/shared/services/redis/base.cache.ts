// Import necessary modules and dependencies
import Logger from 'bunyan';
import { createClient } from 'redis';
import { config } from '@root/config';

// Define the type for the Redis client
export type RedisClient = ReturnType<typeof createClient>;

// Abstract class for the base cache functionality
export abstract class BaseCache {
  client: RedisClient; // Redis client instance
  log: Logger; // Logger instance

  // Constructor for the base cache class
  constructor(cacheName: string) {
    // Create a Redis client using the URL from the configuration
    this.client = createClient({ url: config.REDIS_HOST });

    // Create a logger instance with the given cacheName
    this.log = config.createLogger(cacheName);

    // Call the method to handle cache errors
    this.cacheError();
  }

  // Private method to handle cache errors
  private cacheError(): void {
    // Listen for 'error' events on the Redis client
    this.client.on('error', (error: unknown) => {
      // Log the error using the logger instance
      this.log.error(error);
    });
  }
}
