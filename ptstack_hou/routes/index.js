import express from 'express'
import { getIndex } from '../controllers/indexController.js'

const router = express.Router()

/* GET home page. */
router.get('/', getIndex)

export default router
