// Import necessary modules and types
import { JoiRequestValidationError } from "@global/helpers/error-handler";
import { Request } from "express";
import { ObjectSchema } from "joi";

// Define a custom type for the decorator function
type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

// Define the decorator function
export function joiValidation(schema: ObjectSchema): IJoiDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    // Store the original method being decorated
    const originalMethod = descriptor.value;

    // Override the method with a new async function
    descriptor.value = async function (...args: any[]) {
      // Extract the Express.js request object from the method arguments
      const req: Request = args[0];

      // Validate the request body using the provided schema
      const { error } = await Promise.resolve(schema.validate(req.body));

      // If there's a validation error, throw a custom error
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }

      // If validation succeeds, call the original method with the same arguments
      return originalMethod.apply(this, args);
    };

    // Return the modified descriptor with the new method implementation
    return descriptor;
  };
}
