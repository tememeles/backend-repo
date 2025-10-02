import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Request, Response } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kapee Shop API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce API for Kapee Shop with products, users, orders, and best selling products management',
      contact: {
        name: 'Kapee Shop API Support',
        email: 'support@kapeeshop.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.kapeeshop.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['productname', 'productdescrib', 'productprice', 'productquantity'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID',
              example: '507f1f77bcf86cd799439011'
            },
            productname: {
              type: 'string',
              description: 'Product name',
              example: 'Samsung Galaxy S24'
            },
            productdescrib: {
              type: 'string',
              description: 'Product description',
              example: 'Latest Samsung flagship smartphone with advanced features'
            },
            productprice: {
              type: 'number',
              description: 'Product price',
              example: 999.99
            },
            productquantity: {
              type: 'integer',
              description: 'Available quantity',
              example: 50
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics'
            },
            image: {
              type: 'string',
              description: 'Product image URL',
              example: 'https://res.cloudinary.com/example/image/upload/v1234567890/products/samsung-s24.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        BestSelling: {
          type: 'object',
          required: ['productId', 'salesCount'],
          properties: {
            _id: {
              type: 'string',
              description: 'Best selling record ID',
              example: '507f1f77bcf86cd799439011'
            },
            productId: {
              oneOf: [
                { type: 'string', description: 'Product ID reference' },
                { $ref: '#/components/schemas/Product' }
              ],
              description: 'Reference to the product or populated product object'
            },
            salesCount: {
              type: 'integer',
              description: 'Number of sales',
              example: 150
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics'
            },
            featured: {
              type: 'boolean',
              description: 'Whether this product is featured',
              example: true
            },
            image: {
              type: 'string',
              description: 'Product image URL',
              example: 'https://res.cloudinary.com/example/image/upload/v1234567890/bestselling/samsung-s24.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              description: 'Hashed password',
              writeOnly: true
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['userId', 'products', 'totalAmount'],
          properties: {
            _id: {
              type: 'string',
              description: 'Order ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'User ID who placed the order',
              example: '507f1f77bcf86cd799439011'
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Product ID'
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Quantity ordered'
                  },
                  price: {
                    type: 'number',
                    description: 'Price at time of order'
                  }
                }
              }
            },
            totalAmount: {
              type: 'number',
              description: 'Total order amount',
              example: 1299.99
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              description: 'Order status',
              example: 'pending'
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation timestamp'
            }
          }
        },
        Blog: {
          type: 'object',
          required: ['title', 'content', 'author'],
          properties: {
            _id: {
              type: 'string',
              description: 'Blog ID',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Blog title',
              example: 'Latest Tech Trends 2024'
            },
            content: {
              type: 'string',
              description: 'Blog content',
              example: 'Comprehensive overview of technology trends...'
            },
            author: {
              type: 'string',
              description: 'Blog author',
              example: 'John Smith'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Blog tags',
              example: ['technology', 'trends', '2024']
            },
            published: {
              type: 'boolean',
              description: 'Publication status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Contact: {
          type: 'object',
          required: ['name', 'email', 'message'],
          properties: {
            _id: {
              type: 'string',
              description: 'Contact ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'Contact name',
              example: 'Jane Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email',
              example: 'jane.doe@example.com'
            },
            message: {
              type: 'string',
              description: 'Contact message',
              example: 'I have a question about your products...'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Product not found'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            }
          }
        }
      },
      parameters: {
        ProductId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Product ID'
        },
        UserId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'User ID'
        },
        OrderId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Order ID'
        },
        Limit: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of items to return'
        },
        Category: {
          name: 'category',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Filter by category'
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Products',
        description: 'Product management operations'
      },
      {
        name: 'Best Selling',
        description: 'Best selling products management'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Orders',
        description: 'Order management operations'
      },
      {
        name: 'Blogs',
        description: 'Blog management operations'
      },
      {
        name: 'Contact',
        description: 'Contact form operations'
      },
      {
        name: 'Upload',
        description: 'File upload operations'
      },
      {
        name: 'OTP',
        description: 'OTP verification operations'
      }
    ]
  },
  apis: [
    './routes/*.ts',
    './index.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Kapee Shop API Documentation'
  }));
  
  // API docs JSON endpoint
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;