// middlewares/error-handler.js
import type { Request, Response, NextFunction } from 'express'

import { failure } from '../utils/response'

export default (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  failure(res, { error: err })
}
