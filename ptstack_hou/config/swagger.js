/**
 * Swagger配置文件
 * 用于生成API文档
 */
import swaggerJsdoc from 'swagger-jsdoc'

/**
 * Swagger配置选项
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // OpenAPI版本
    info: {
      title: 'PTStack 认证API文档', // 文档标题
      description: '用户登录注册相关接口文档', // 文档描述
      version: '1.0.0', // 文档版本
      contact: {
        name: 'PTStack开发团队', // 联系人
        email: 'contact@ptstack.com', // 联系邮箱
      },
      license: {
        name: 'MIT', // 许可证名称
        url: 'https://opensource.org/licenses/MIT', // 许可证URL
      },
    },
    servers: [
      {
        url: 'http://localhost:3000', // 服务器URL
        description: '本地开发服务器', // 服务器描述
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http', // 认证类型
          scheme: 'bearer', // 认证方案
          bearerFormat: 'JWT', // Bearer格式
          description: '请输入登录获取的JWT Token', // 认证描述
        },
      },
      schemas: {
        User: {
          type: 'object', // 数据类型
          properties: {
            id: {
              type: 'integer', // 字段类型
              description: '用户ID', // 字段描述
            },
            username: {
              type: 'string', // 字段类型
              description: '用户名', // 字段描述
            },
            email: {
              type: 'string', // 字段类型
              description: '邮箱地址', // 字段描述
            },
          },
          required: ['username', 'email'], // 必填字段
        },
        RegisterRequest: {
          type: 'object', // 数据类型
          properties: {
            username: {
              type: 'string', // 字段类型
              description: '用户名', // 字段描述
            },
            password: {
              type: 'string', // 字段类型
              description: '密码', // 字段描述
            },
            email: {
              type: 'string', // 字段类型
              description: '邮箱地址', // 字段描述
            },
          },
          required: ['username', 'password', 'email'], // 必填字段
        },
        LoginRequest: {
          type: 'object', // 数据类型
          properties: {
            username: {
              type: 'string', // 字段类型
              description: '用户名', // 字段描述
            },
            password: {
              type: 'string', // 字段类型
              description: '密码', // 字段描述
            },
          },
          required: ['username', 'password'], // 必填字段
        },
        RegisterResponse: {
          type: 'object', // 数据类型
          properties: {
            message: {
              type: 'string', // 字段类型
              description: '响应消息', // 字段描述
            },
            user: {
              $ref: '#/components/schemas/User', // 引用User schema
            },
          },
        },
        LoginResponse: {
          type: 'object', // 数据类型
          properties: {
            message: {
              type: 'string', // 字段类型
              description: '响应消息', // 字段描述
            },
            user: {
              $ref: '#/components/schemas/User', // 引用User schema
            },
            token: {
              type: 'string', // 字段类型
              description: '认证Token', // 字段描述
            },
          },
        },
        ErrorResponse: {
          type: 'object', // 数据类型
          properties: {
            message: {
              type: 'string', // 字段类型
              description: '错误消息', // 字段描述
            },
          },
        },
      },
      responses: {
        400: {
          description: '请求参数错误', // 响应描述
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse', // 引用ErrorResponse schema
              },
            },
          },
        },
        401: {
          description: '认证失败', // 响应描述
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse', // 引用ErrorResponse schema
              },
            },
          },
        },
        500: {
          description: '服务器内部错误', // 响应描述
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse', // 引用ErrorResponse schema
              },
            },
          },
        },
      },
    },
  },
  apis: ['./controllers/*.js', './routes/*.js'], // 扫描的文件路径，用于生成API文档
}

/**
 * 生成的Swagger文档
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions)

export default swaggerSpec
