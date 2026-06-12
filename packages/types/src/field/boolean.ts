import * as z from 'zod'

const judgeBoolean = z
  .union([z.string(), z.number(), z.boolean(), z.undefined()])
  .transform((val) => {
    // 空值、undefined、"0"、0、"false" 都转为 false
    if (
      val === undefined ||
      val === '' ||
      val === 0 ||
      val === '0' ||
      val === 'false'
    ) {
      return false
    }
    return true
  })

// 软删除标志 false未删除 true已删除
export const isDeleted = judgeBoolean

// 状态
export const status = judgeBoolean
