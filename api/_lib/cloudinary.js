import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'iryvrkf0',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generate a cryptographically signed signature for direct frontend-to-Cloudinary upload.
 * Keeps the API secret secure strictly on the server.
 */
export function generateSignedUploadParams(folder = 'parkingspot') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'iryvrkf0',
    folder,
  };
}

/**
 * Direct server-side upload helper (for data URI, base64, or remote image URL)
 */
export async function uploadImageServerSide(fileUri, folder = 'parkingspot') {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
    // If running in development without credentials, provide a fallback placeholder
    console.warn('Cloudinary API credentials missing. Returning fallback image URL.');
    return {
      secure_url: fileUri.startsWith('http') ? fileUri : 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      public_id: 'mock_upload_' + Date.now(),
    };
  }

  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
    resource_type: 'auto',
  });

  return result;
}

export default cloudinary;
