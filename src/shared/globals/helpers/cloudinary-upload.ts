// Import necessary modules and dependencies from Cloudinary
import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * Uploads a file to Cloudinary.
 *
 * @param {string} file - The file to upload.
 * @param {string} public_id - Optional. The public ID for the uploaded resource.
 * @param {boolean} overwrite - Optional. Whether to overwrite an existing resource.
 * @param {boolean} invalidate - Optional. Whether to invalidate the CDN cache after upload.
 * @returns {Promise<UploadApiResponse|UploadApiErrorResponse|undefined>} - A promise containing the upload response or error.
 */
export function uploads(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    // Use the Cloudinary uploader to upload the file with specified options
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        overwrite,
        invalidate,
      },
      // Callback function with error and result parameters
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          // If there's an error, resolve the promise with the error response
          resolve(error);
        } else {
          // If the upload is successful, resolve the promise with the result response
          resolve(result);
        }
      }
    );
  });
}
