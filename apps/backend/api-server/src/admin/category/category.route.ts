import { Router } from 'express'
import * as categoryController from './category.controller'
import { requestCategorySchemas as category } from '@ptstack/types'
import { validate } from '../../../middlewares/zod-validate'

const router = Router()

router.get(
  '/categories',
  validate(category.GetListSchema),
  categoryController.getListController,
)
router.get(
  '/categories/:id',
  validate(category.GetDetailSchema),
  categoryController.getDetailController,
)
router.post(
  '/categories',
  validate(category.AddSchema),
  categoryController.addController,
)
router.put(
  '/categories/:id',
  validate(category.UpdateSchema),
  categoryController.updateController,
)
router.patch(
  '/categories/delete',
  validate(category.OperateManySchema),
  categoryController.softDeleteManyController,
)
router.patch(
  '/categories/delete/:id',
  validate(category.OperateSchema),
  categoryController.softDeleteController,
)
router.patch(
  '/categories/restore',
  validate(category.OperateManySchema),
  categoryController.restoreManyController,
)
router.patch(
  '/categories/restore/:id',
  validate(category.OperateSchema),
  categoryController.restoreController,
)
router.delete(
  '/categories',
  validate(category.OperateManySchema),
  categoryController.deleteManyController,
)
router.delete(
  '/categories/:id',
  validate(category.OperateSchema),
  categoryController.deleteController,
)

export default router
