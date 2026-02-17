import swaggerJsdoc from 'swagger-jsdoc';

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PTStack 认证API文档',
      description: '用户登录注册相关接口文档',
      version: '1.0.0',
      contact: {
        name: 'PTStack开发团队',
        email: 'contact@ptstack.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '请输入登录获取的JWT Token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '用户ID'
            },
            username: {
              type: 'string',
              description: '用户名'
            },
            email: {
              type: 'string',
              description: '邮箱地址'
            }
          },
          required: ['username', 'email']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: '用户名'
            },
            password: {
              type: 'string',
              description: '密码'
            },
            email: {
              type: 'string',
              description: '邮箱地址'
            }
          },
          required: ['username', 'password', 'email']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: '用户名'
            },
            password: {
              type: 'string',
              description: '密码'
            }
          },
          required: ['username', 'password']
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '响应消息'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '响应消息'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: '认证Token'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '错误消息'
            }
          }
        }
      },
      responses: {
        '400': {
          description: '请求参数错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          description: '认证失败',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          description: '服务器内部错误',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./controllers/*.js', './routes/*.js'] // 扫描的文件路径
};

// 生成Swagger文档
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
