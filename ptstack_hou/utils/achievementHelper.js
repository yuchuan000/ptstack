import { execute } from '../config/db.js'

export const checkAndGrantAchievements = async (userId, type, currentValue) => {
  try {
    const achievements = await execute(
      'SELECT * FROM achievements WHERE type = ? AND condition_value <= ? AND is_unconditional = 0',
      [type, currentValue]
    )

    for (const achievement of achievements) {
      const existing = await execute(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userId, achievement.id]
      )

      if (existing.length === 0) {
        await execute(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievement.id]
        )

        await execute(
          `INSERT INTO notifications (user_id, type, content, related_id, is_read) 
           VALUES (?, 'achievement', ?, ?, 0)`,
          [userId, `恭喜你获得成就：${achievement.name}！`, achievement.id]
        )
      }
    }
  } catch (error) {
    console.error('检查成就失败:', error.message)
  }
}
