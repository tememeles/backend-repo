import express, { Request, Response } from 'express';
import { cloudinary, upload } from '../cloudinaryConfig.js';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

// Define Cloudinary upload result type
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const router = express.Router();

// Extend Request type to include file
interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload image file to Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, WebP - max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Cloudinary image URL
 *                     public_id:
 *                       type: string
 *                       description: Cloudinary public ID
 *                     width:
 *                       type: integer
 *                     height:
 *                       type: integer
 *                     format:
 *                       type: string
 *                     bytes:
 *                       type: integer
 *       400:
 *         description: Bad request - invalid file or missing image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No image file provided."
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// POST /api/upload - upload image to Cloudinary
router.post('/', upload.single('image'), async (req: UploadRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ 
        success: false,
        error: 'No image file provided.' 
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      res.status(400).json({ 
        success: false,
        error: 'File size too large. Maximum size is 5MB.' 
      });
      return;
    }

    // Upload to Cloudinary using Promise
    const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        }, 
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new Error(error.message || 'Upload failed'));
          } else if (result) {
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error('Upload failed - no result'));
          }
        }
      ).end(req.file!.buffer);
    });

    const result = await uploadPromise;
    
    res.status(200).json({ 
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: Math.round(result.bytes / 1024) // Size in KB
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
});

// DELETE /api/upload/:publicId - delete image from Cloudinary
router.delete('/:publicId', async (req: Request<{ publicId: string }>, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      res.status(400).json({ 
        success: false,
        error: 'Public ID is required' 
      });
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ 
        success: true,
        message: 'Image deleted successfully',
        public_id: publicId
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Image not found or already deleted' 
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed' 
    });
  }
});

// GET /api/upload/info/:publicId - get image information
router.get('/info/:publicId', async (req: Request<{ publicId: string }>, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      res.status(400).json({ 
        success: false,
        error: 'Public ID is required' 
      });
      return;
    }

    const result = await cloudinary.api.resource(publicId);
    
    res.json({ 
      success: true,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: Math.round(result.bytes / 1024), // Size in KB
        created_at: result.created_at
      }
    });

  } catch (error) {
    console.error('Info error:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ 
        success: false,
        error: 'Image not found' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get image info' 
      });
    }
  }
});

export default router;