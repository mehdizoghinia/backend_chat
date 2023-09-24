// Import necessary modules
import fs from 'fs'; // Node.js File System module for file reading
import ejs from 'ejs'; // EJS templating engine module

// Define a TypeScript class for generating a password reset email template
class ForgotPasswordTemplate {
  // Public method for generating the password reset template
  public passwordResetTemplate(username: string, resetLink: string): string {
    // Read the content of the EJS template file
    const templateContent = fs.readFileSync(__dirname + '/forgot-pw-templ.ejs', 'utf8');

    // Define data to be passed into the template
    const templateData = {
      username,
      resetLink,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    };

    // Use EJS to render the template with the provided data
    const renderedTemplate = ejs.render(templateContent, templateData);

    // Return the generated HTML email template as a string
    return renderedTemplate;
  }
}

// Create an instance of the ForgotPasswordTemplate class
export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
