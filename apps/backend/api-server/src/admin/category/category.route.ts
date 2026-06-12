import { Router } from 'express'
import * as categoryController from './category.controller'
import { Interface } from '@ptstack/types'
import { validate } from '../../../middlewares/zod-validate'

const router = Router()

router.get(
  '/categories',
  validate(Interface.Category.Request.GetListSchema),
  categoryController.getListController,
)
router.get(
  '/categories/:id',
  validate(Interface.Category.Request.GetDetailSchema),
  categoryController.getDetailController,
)
router.post(
  '/categories',
  validate(Interface.Category.Request.AddSchema),
  categoryController.addController,
)
router.put(
  '/categories/:id',
  validate(Interface.Category.Request.UpdateSchema),
  categoryController.updateController,
)
router.patch(
  '/categories/delete',
  validate(Interface.Category.Request.OperateManySchema),
  categoryController.softDeleteManyController,
)
router.patch(
  '/categories/delete/:id',
  validate(Interface.Category.Request.OperateSchema),
  categoryController.softDeleteController,
)
router.patch(
  '/categories/restore',
  validate(Interface.Category.Request.OperateManySchema),
  categoryController.restoreManyController,
)
router.patch(
  '/categories/restore/:id',
  validate(Interface.Category.Request.OperateSchema),
  categoryController.restoreController,
)
router.delete(
  '/categories',
  validate(Interface.Category.Request.OperateManySchema),
  categoryController.deleteManyController,
)
router.delete(
  '/categories/:id',
  validate(Interface.Category.Request.OperateSchema),
  categoryController.deleteController,
)

export default router
