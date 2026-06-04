import { type RequestHandler } from 'express'
import { type LoginDto } from './auth.dto'
import * as authService from './auth.service'

export const loginController: RequestHandler = (req, res) => {
  const { username, password } = req.body as LoginDto
  const data = authService.loginService(username, password)
  res.status(200).json(data)
}
