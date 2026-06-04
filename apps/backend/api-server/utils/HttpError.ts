export class HttpError {
  constructor(
    public readonly code: number,
    public readonly message: string,
  ) {}

  // 400 参数错误
  static badRequest(message = '参数错误') {
    return new HttpError(400, message)
  }

  // 401 无权限
  static unauthorized(message = '无权限') {
    return new HttpError(401, message)
  }

  // 404 数据不存在
  static notFound(message = '数据不存在') {
    return new HttpError(404, message)
  }

  // 409 数据已存在
  static conflict(message = '数据已存在') {
    return new HttpError(409, message)
  }

  // 500 服务器错误
  static internal(message = '服务器错误') {
    return new HttpError(500, message)
  }
}
