// 数据库工具函数
import { execute } from '../config/db.js'

/**
 * 获取表的最大排序值
 * @param {string} tableName - 表名
 * @returns {Promise<number>} 最大排序值
 */
export async function getMaxSortValue(tableName) {
  try {
    const maxSort = await execute(`SELECT MAX(sort_order) as max_sort FROM ${tableName}`)
    return (maxSort[0].max_sort || 0) + 1
  } catch (error) {
    console.error(`获取${tableName}最大排序值失败:`, error)
    throw error
  }
}

/**
 * 检查记录是否存在
 * @param {string} tableName - 表名
 * @param {number} id - 记录ID
 * @returns {Promise<boolean>} 是否存在
 */
export async function checkRecordExists(tableName, id) {
  try {
    const result = await execute(`SELECT id FROM ${tableName} WHERE id = ?`, [id])
    return result.length > 0
  } catch (error) {
    console.error(`检查${tableName}记录是否存在失败:`, error)
    throw error
  }
}

/**
 * 更新表的排序
 * @param {string} tableName - 表名
 * @param {Array<number>} ids - 排序后的ID数组
 * @returns {Promise<void>}
 */
export async function updateSortOrder(tableName, ids) {
  try {
    for (let i = 0; i < ids.length; i++) {
      await execute(`UPDATE ${tableName} SET sort_order = ? WHERE id = ?`, [i, ids[i]])
    }
  } catch (error) {
    console.error(`更新${tableName}排序失败:`, error)
    throw error
  }
}
