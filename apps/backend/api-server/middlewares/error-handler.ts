// middlewares/error-handler.js
import type { Response } from 'express'

import { failure } from '../utils/response'

export default (err: unknown, res: Response) => {
  failure(res, { error: err })
}
