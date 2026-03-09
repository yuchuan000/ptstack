/**
 * 关于我们页面配置控制器
 * 处理关于我们页面的团队成员、联系信息和底部信息的CRUD操作
 */
import { execute } from '../config/db.js'
import { getMaxSortValue, checkRecordExists, updateSortOrder } from '../utils/dbUtils.js'

/**
 * 获取团队成员列表
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function getTeamMembers(req, res) {
  try {
    const rows = await execute('SELECT * FROM about_team ORDER BY sort_order ASC, id ASC')

    // 解析 JSON 字段
    const members = rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      avatar: row.avatar,
      bio: row.bio,
      skills: row.skills ? JSON.parse(row.skills) : [],
      portfolio: row.portfolio ? JSON.parse(row.portfolio) : [],
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    res.json({ members })
  } catch (error) {
    console.error('获取团队成员失败:', error)
    res.status(500).json({ error: '获取团队成员失败' })
  }
}

/**
 * 创建团队成员
 * @param {object} req - Express请求对象，包含团队成员信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function createTeamMember(req, res) {
  const { name, role, avatar, bio, skills, portfolio } = req.body

  if (!name || !role) {
    return res.status(400).json({ error: '姓名和职位不能为空' })
  }

  try {
    // 获取当前最大排序值
    const sortOrder = await getMaxSortValue('about_team')

    const result = await execute(
      'INSERT INTO about_team (name, role, avatar, bio, skills, portfolio, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        role,
        avatar,
        bio,
        JSON.stringify(skills || []),
        JSON.stringify(portfolio || []),
        sortOrder,
      ],
    )

    res.json({ message: '创建团队成员成功', id: result.insertId })
  } catch (error) {
    console.error('创建团队成员失败:', error)
    res.status(500).json({ error: '创建团队成员失败' })
  }
}

/**
 * 更新团队成员
 * @param {object} req - Express请求对象，包含团队成员ID和更新信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function updateTeamMember(req, res) {
  const { id } = req.params
  const { name, role, avatar, bio, skills, portfolio } = req.body

  if (!name || !role) {
    return res.status(400).json({ error: '姓名和职位不能为空' })
  }

  try {
    // 检查团队成员是否存在
    const exists = await checkRecordExists('about_team', id)
    if (!exists) {
      return res.status(404).json({ error: '团队成员不存在' })
    }

    await execute(
      'UPDATE about_team SET name = ?, role = ?, avatar = ?, bio = ?, skills = ?, portfolio = ? WHERE id = ?',
      [name, role, avatar, bio, JSON.stringify(skills || []), JSON.stringify(portfolio || []), id],
    )

    res.json({ message: '更新团队成员成功' })
  } catch (error) {
    console.error('更新团队成员失败:', error)
    res.status(500).json({ error: '更新团队成员失败' })
  }
}

/**
 * 删除团队成员
 * @param {object} req - Express请求对象，包含团队成员ID
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function deleteTeamMember(req, res) {
  const { id } = req.params

  try {
    // 检查团队成员是否存在
    const exists = await checkRecordExists('about_team', id)
    if (!exists) {
      return res.status(404).json({ error: '团队成员不存在' })
    }

    await execute('DELETE FROM about_team WHERE id = ?', [id])
    res.json({ message: '删除团队成员成功' })
  } catch (error) {
    console.error('删除团队成员失败:', error)
    res.status(500).json({ error: '删除团队成员失败' })
  }
}

/**
 * 获取联系信息列表
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function getContactItems(req, res) {
  try {
    const rows = await execute('SELECT * FROM about_contact ORDER BY sort_order ASC, id ASC')

    const items = rows.map((row) => ({
      id: row.id,
      icon: row.icon,
      name: row.name,
      info: row.info,
      link: row.link,
      sort_order: row.sort_order,
      is_hidden: row.is_hidden || false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    res.json({ items })
  } catch (error) {
    console.error('获取联系信息失败:', error)
    res.status(500).json({ error: '获取联系信息失败' })
  }
}

/**
 * 创建联系信息
 * @param {object} req - Express请求对象，包含联系信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function createContactItem(req, res) {
  const { icon, name, info, link } = req.body

  if (!icon || !name || !info) {
    return res.status(400).json({ error: '图标、名称和信息不能为空' })
  }

  try {
    // 获取当前最大排序值
    const sortOrder = await getMaxSortValue('about_contact')

    const result = await execute(
      'INSERT INTO about_contact (icon, name, info, link, sort_order) VALUES (?, ?, ?, ?, ?)',
      [icon, name, info, link, sortOrder],
    )

    res.json({ message: '创建联系信息成功', id: result.insertId })
  } catch (error) {
    console.error('创建联系信息失败:', error)
    res.status(500).json({ error: '创建联系信息失败' })
  }
}

/**
 * 更新联系信息
 * @param {object} req - Express请求对象，包含联系信息ID和更新信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function updateContactItem(req, res) {
  const { id } = req.params
  const { icon, name, info, link, is_hidden } = req.body

  if (!icon || !name || !info) {
    return res.status(400).json({ error: '图标、名称和信息不能为空' })
  }

  try {
    // 检查联系信息是否存在
    const exists = await checkRecordExists('about_contact', id)
    if (!exists) {
      return res.status(404).json({ error: '联系信息不存在' })
    }

    await execute(
      'UPDATE about_contact SET icon = ?, name = ?, info = ?, link = ?, is_hidden = ? WHERE id = ?',
      [icon, name, info, link, is_hidden ? 1 : 0, id],
    )

    res.json({ message: '更新联系信息成功' })
  } catch (error) {
    console.error('更新联系信息失败:', error)
    res.status(500).json({ error: '更新联系信息失败' })
  }
}

/**
 * 删除联系信息
 * @param {object} req - Express请求对象，包含联系信息ID
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function deleteContactItem(req, res) {
  const { id } = req.params

  try {
    // 检查联系信息是否存在
    const exists = await checkRecordExists('about_contact', id)
    if (!exists) {
      return res.status(404).json({ error: '联系信息不存在' })
    }

    await execute('DELETE FROM about_contact WHERE id = ?', [id])
    res.json({ message: '删除联系信息成功' })
  } catch (error) {
    console.error('删除联系信息失败:', error)
    res.status(500).json({ error: '删除联系信息失败' })
  }
}

/**
 * 更新联系信息排序
 * @param {object} req - Express请求对象，包含排序ID列表
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function updateContactOrder(req, res) {
  const { ids } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: '排序ID列表不能为空' })
  }

  try {
    await updateSortOrder('about_contact', ids)
    res.json({ message: '更新排序成功' })
  } catch (error) {
    console.error('更新排序失败:', error)
    res.status(500).json({ error: '更新排序失败' })
  }
}

/**
 * 切换联系信息显示/隐藏状态
 * @param {object} req - Express请求对象，包含联系信息ID和显示状态
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function toggleContactVisibility(req, res) {
  const { id } = req.params
  const { is_hidden } = req.body

  try {
    const [rows] = await execute('SELECT is_hidden FROM about_contact WHERE id = ?', [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '联系信息不存在' })
    }

    const newHiddenStatus =
      is_hidden !== undefined ? (is_hidden ? 1 : 0) : rows[0].is_hidden ? 0 : 1

    await execute('UPDATE about_contact SET is_hidden = ? WHERE id = ?', [newHiddenStatus, id])

    res.json({
      message: newHiddenStatus ? '隐藏成功' : '显示成功',
      is_hidden: newHiddenStatus === 1,
    })
  } catch (error) {
    console.error('切换显示状态失败:', error)
    res.status(500).json({ error: '切换显示状态失败' })
  }
}

/**
 * 获取底部信息列表
 * @param {object} req - Express请求对象
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function getFooterItems(req, res) {
  try {
    const rows = await execute(
      'SELECT * FROM about_footer ORDER BY pc_row_id ASC, mobile_row_id ASC, sort_order ASC, id ASC',
    )

    const items = rows.map((row) => ({
      id: row.id,
      display: row.display,
      link: row.link,
      pcRowId: row.pc_row_id,
      mobileRowId: row.mobile_row_id,
      showOnPc: row.show_on_pc === 1,
      showOnMobile: row.show_on_mobile === 1,
      sort_order: row.sort_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    res.json({ items })
  } catch (error) {
    console.error('获取底部信息失败:', error)
    res.status(500).json({ error: '获取底部信息失败' })
  }
}

/**
 * 创建底部信息
 * @param {object} req - Express请求对象，包含底部信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function createFooterItem(req, res) {
  const { display, link, pcRowId, mobileRowId, showOnPc, showOnMobile } = req.body

  if (!display) {
    return res.status(400).json({ error: '显示内容不能为空' })
  }

  try {
    // 获取当前最大排序值
    const sortOrder = await getMaxSortValue('about_footer')

    const result = await execute(
      'INSERT INTO about_footer (display, link, pc_row_id, mobile_row_id, show_on_pc, show_on_mobile, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        display,
        link,
        pcRowId || 1,
        mobileRowId || 1,
        showOnPc ? 1 : 0,
        showOnMobile ? 1 : 0,
        sortOrder,
      ],
    )

    res.json({ message: '创建底部信息成功', id: result.insertId })
  } catch (error) {
    console.error('创建底部信息失败:', error)
    res.status(500).json({ error: '创建底部信息失败' })
  }
}

/**
 * 更新底部信息
 * @param {object} req - Express请求对象，包含底部信息ID和更新信息
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function updateFooterItem(req, res) {
  const { id } = req.params
  const { display, link, pcRowId, mobileRowId, showOnPc, showOnMobile } = req.body

  if (!display) {
    return res.status(400).json({ error: '显示内容不能为空' })
  }

  try {
    // 检查底部信息是否存在
    const exists = await checkRecordExists('about_footer', id)
    if (!exists) {
      return res.status(404).json({ error: '底部信息不存在' })
    }

    await execute(
      'UPDATE about_footer SET display = ?, link = ?, pc_row_id = ?, mobile_row_id = ?, show_on_pc = ?, show_on_mobile = ? WHERE id = ?',
      [display, link, pcRowId || 1, mobileRowId || 1, showOnPc ? 1 : 0, showOnMobile ? 1 : 0, id],
    )

    res.json({ message: '更新底部信息成功' })
  } catch (error) {
    console.error('更新底部信息失败:', error)
    res.status(500).json({ error: '更新底部信息失败' })
  }
}

/**
 * 删除底部信息
 * @param {object} req - Express请求对象，包含底部信息ID
 * @param {object} res - Express响应对象
 * @returns {Promise<void>}
 */
export async function deleteFooterItem(req, res) {
  const { id } = req.params

  try {
    // 检查底部信息是否存在
    const exists = await checkRecordExists('about_footer', id)
    if (!exists) {
      return res.status(404).json({ error: '底部信息不存在' })
    }

    await execute('DELETE FROM about_footer WHERE id = ?', [id])
    res.json({ message: '删除底部信息成功' })
  } catch (error) {
    console.error('删除底部信息失败:', error)
    res.status(500).json({ error: '删除底部信息失败' })
  }
}
