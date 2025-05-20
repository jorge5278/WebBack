import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios',
      version: '1.0.0',
      description: 'Documentación de la API para gestión de usuarios'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id:     { type: 'integer' },
            nombre: { type: 'string'  },
            email:  { type: 'string'  },
            rol:    { type: 'string'  }
          }
        },
        Credenciales: {
          type: 'object',
          properties: {
            email:    { type: 'string' },
            password: { type: 'string' }
          },
          required: ['email', 'password']
        },
        Token: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        }
      }
    },
    servers: [
      {
        url: process.env.SERVER_URL,    // p.ej. https://webback-production-7057.up.railway.app/api
        description: 'Backend en Railway'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
