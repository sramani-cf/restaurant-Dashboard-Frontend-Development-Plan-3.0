const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Dashboard API',
      version: '1.0.0',
      description: 'A comprehensive restaurant management system API with real-time features',
      contact: {
        name: 'Restaurant Dashboard Team',
        email: 'support@restaurantdashboard.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:5000/api/${config.apiVersion}`,
        description: 'Development server',
      },
      {
        url: `https://api.restaurantdashboard.com/api/${config.apiVersion}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Authentication required',
                  },
                  message: {
                    type: 'string',
                    example: 'No authorization header provided',
                  },
                  statusCode: {
                    type: 'number',
                    example: 401,
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Insufficient permissions',
                  },
                  message: {
                    type: 'string',
                    example: 'You do not have permission to access this resource',
                  },
                  statusCode: {
                    type: 'number',
                    example: 403,
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Validation failed',
                  },
                  message: {
                    type: 'string',
                    example: 'The provided data is invalid',
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email',
                        },
                        message: {
                          type: 'string',
                          example: 'Email is required',
                        },
                      },
                    },
                  },
                  statusCode: {
                    type: 'number',
                    example: 400,
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                  message: {
                    type: 'string',
                    example: 'The requested resource was not found',
                  },
                  statusCode: {
                    type: 'number',
                    example: 404,
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Internal server error',
                  },
                  message: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                  statusCode: {
                    type: 'number',
                    example: 500,
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Restaurants',
        description: 'Restaurant management operations',
      },
      {
        name: 'Tables',
        description: 'Table and floor plan management',
      },
      {
        name: 'Menu',
        description: 'Menu and item management',
      },
      {
        name: 'Orders',
        description: 'Order processing and management',
      },
      {
        name: 'Reservations',
        description: 'Reservation management',
      },
      {
        name: 'Customers',
        description: 'Customer management and loyalty',
      },
      {
        name: 'Inventory',
        description: 'Inventory and supply chain management',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting',
      },
      {
        name: 'Health',
        description: 'System health and monitoring',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js', // Path to the API routes
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;