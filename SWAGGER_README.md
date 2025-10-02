# Kapee Shop API Documentation

## Overview

Welcome to the **Kapee Shop API** documentation! This comprehensive RESTful API powers the Kapee Shop e-commerce platform, providing endpoints for product management, user authentication, order processing, and more.

## 🚀 Quick Start

### Access Swagger Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:5000/api-docs
```

### API Base URL

```
Development: http://localhost:5000
Production: https://api.kapeeshop.com
```

### Authentication

Currently, the API uses simple authentication. Some endpoints may require admin privileges.

## 📚 API Endpoints Overview

### Products (`/api/products`)
- **GET** `/api/products` - Get all products with filtering and pagination
- **POST** `/api/products` - Create new product(s)
- **GET** `/api/products/:id` - Get product by ID
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

### Best Selling Products (`/api/bestselling`)
- **GET** `/api/bestselling` - Get best selling products
- **GET** `/api/bestselling/featured` - Get featured best selling products
- **POST** `/api/bestselling` - Add product to best selling collection
- **PUT** `/api/bestselling/:id` - Update best selling product
- **DELETE** `/api/bestselling/:id` - Remove from best selling

### Users (`/api/users`, `/api/login`)
- **POST** `/api/users` - Register new user
- **POST** `/api/login` - User login
- **GET** `/api/users` - Get all users (admin)
- **GET** `/api/users/:id` - Get user by ID

### Orders (`/api/orders`)
- **POST** `/api/orders` - Create new order
- **POST** `/api/orders/batch` - Batch order creation
- **GET** `/api/orders` - Get all orders
- **GET** `/api/orders/:id` - Get order by ID
- **PUT** `/api/orders/:id` - Update order status

### Contact (`/api/contact`)
- **POST** `/api/contact` - Submit contact message
- **GET** `/api/contact` - Get all contact messages (admin)
- **GET** `/api/contact/:id` - Get contact message by ID
- **DELETE** `/api/contact/:id` - Delete contact message

### File Upload (`/api/upload`)
- **POST** `/api/upload` - Upload image to Cloudinary

### OTP Verification (`/api/otp`)
- **POST** `/api/otp/create` - Generate and send OTP
- **POST** `/api/otp/verify` - Verify OTP code
- **POST** `/api/otp/resend` - Resend OTP

## 🛠 Technical Details

### Request/Response Format
- **Content-Type**: `application/json`
- **Encoding**: UTF-8
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* Response data */ }
}
```

## 🔧 Features

### Product Management
- **Filtering**: Filter by category, price range, stock status
- **Search**: Full-text search across product names, descriptions, and categories
- **Sorting**: Sort by price, name, date (ascending/descending)
- **Pagination**: Efficient pagination with limit and page parameters

### File Upload
- **Cloudinary Integration**: Secure image storage and optimization
- **File Validation**: Support for JPEG, PNG, GIF, WebP formats
- **Size Limits**: Maximum 5MB per file
- **Automatic Optimization**: Images are automatically optimized for web delivery

### Best Selling Products
- **Sales Tracking**: Track sales count for each product
- **Featured Products**: Mark products as featured for homepage display
- **Category Filtering**: Filter best sellers by product category
- **Popularity Sorting**: Automatic sorting by sales count

## 📋 Data Models

### Product Schema
```json
{
  "_id": "string",
  "productname": "string",
  "productdescrib": "string", 
  "productprice": "number",
  "productquantity": "integer",
  "category": "string",
  "image": "string (URL)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Best Selling Schema
```json
{
  "_id": "string",
  "productId": "string (Product reference)",
  "salesCount": "integer",
  "category": "string",
  "featured": "boolean",
  "image": "string (URL)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### User Schema
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string (user|admin)",
  "createdAt": "date"
}
```

### Order Schema
```json
{
  "_id": "string",
  "userId": "string",
  "products": [
    {
      "productId": "string",
      "quantity": "integer",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string (pending|confirmed|shipped|delivered|cancelled)",
  "shippingAddress": {
    "street": "string",
    "city": "string", 
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "createdAt": "date"
}
```

## 🧪 Testing the API

### Using Swagger UI
1. Navigate to `http://localhost:5000/api-docs`
2. Click on any endpoint to expand it
3. Click "Try it out" button
4. Fill in the required parameters
5. Click "Execute" to test the endpoint

### Using cURL
```bash
# Get all products
curl -X GET "http://localhost:5000/api/products" -H "accept: application/json"

# Create a new product
curl -X POST "http://localhost:5000/api/products" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "productname": "Test Product",
    "productdescrib": "Test Description",
    "productprice": 99.99,
    "productquantity": 10,
    "category": "Electronics"
  }'

# Upload an image
curl -X POST "http://localhost:5000/api/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/your/image.jpg"
```

## 🔒 Security Features

- **Input Validation**: All inputs are validated for type and format
- **File Upload Security**: File type and size restrictions
- **Error Handling**: Comprehensive error handling and logging
- **CORS Configuration**: Cross-origin resource sharing configured
- **Environment Variables**: Sensitive data stored in environment variables

## 🚀 Deployment

### Environment Variables Required
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kapeeshop
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@kapeeshop.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Running the Server
```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## 📞 Support

For questions about the API, please contact:
- **Email**: support@kapeeshop.com
- **Documentation**: Available at `/api-docs` when server is running
- **Repository**: [GitHub Repository](https://github.com/tememeles/Kapee-Shop)

## 📄 License

This API is licensed under the MIT License. See the LICENSE file for details.

---

*This documentation is automatically generated from OpenAPI 3.0 specifications using Swagger UI.*