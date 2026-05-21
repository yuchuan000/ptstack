import { type RequestHandler } from 'express'
import { type LoginDto } from './auth.dto'
import * as authService from './auth.service'

export const login: RequestHandler = (req, res) => {
  const { username, password } = req.body as LoginDto
  const data = authService.authAdmin(username, password)
  res.status(200).json(data)
}
