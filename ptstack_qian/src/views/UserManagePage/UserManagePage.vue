<template>
  <div class="user-manage-page">
    <PageHeader title="用户管理" subtitle="管理系统用户，编辑用户信息和分配权限">
      <template #actions>
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <el-card class="users-card">
        <div class="tabs-section">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            用户列表
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'badge-styles' }"
            @click="activeTab = 'badge-styles'"
          >
            标识样式
          </div>
        </div>

        <!-- 用户列表标签页 -->
        <div v-if="activeTab === 'users'">
          <div class="card-header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名、昵称、邮箱"
              style="width: 280px;"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <!-- PC端表格 -->
          <el-table v-if="!isMobile" :data="users" v-loading="loading" stripe>
            <el-table-column label="用户ID" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.id }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="登录账号" width="140" show-overflow-tooltip />
            <el-table-column prop="nickname" label="昵称" width="140" show-overflow-tooltip />
            <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
            <el-table-column label="用户等级" width="120">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)">
                  {{ getLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="权限" width="200">
              <template #default="{ row }">
                <el-tag v-for="permission in row.permissions" :key="permission" size="small" type="info" style="margin-right: 4px; margin-bottom: 4px;">
                  {{ getPermissionText(permission) }}
                </el-tag>
                <span v-if="!row.permissions || row.permissions.length === 0">无</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="注册时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 移动端卡片列表 -->
          <div v-else class="mobile-card-list">
            <div
              v-for="user in users"
              :key="user.id"
              class="mobile-user-card"
            >
              <div class="card-header-row">
                <div class="card-user-info">
                  <span class="card-username">{{ user.username }}</span>
                  <el-tag size="small" type="info">#{{ user.id }}</el-tag>
                </div>
                <el-tag :type="getLevelType(user.level)" size="small">
                  {{ getLevelText(user.level) }}
                </el-tag>
              </div>
              <div class="card-detail-row">
                <span class="detail-label">昵称:</span>
                <span class="detail-value">{{ user.nickname || '-' }}</span>
              </div>
              <div class="card-detail-row">
                <span class="detail-label">邮箱:</span>
                <span class="detail-value">{{ user.email }}</span>
              </div>
              <div class="card-detail-row">
                <span class="detail-label">权限:</span>
                <span class="detail-value">{{ user.permissions ? user.permissions.map(p => getPermissionText(p)).join(', ') : '无' }}</span>
              </div>
              <div class="card-detail-row">
                <span class="detail-label">注册时间:</span>
                <span class="detail-value">{{ formatDate(user.created_at) }}</span>
              </div>
              <div class="card-actions-row">
                <el-button size="small" @click="handleEdit(user)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(user)">删除</el-button>
              </div>
            </div>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadUsers"
              @current-change="loadUsers"
            />
          </div>
        </div>

        <!-- 标识样式标签页 -->
        <div v-if="activeTab === 'badge-styles'" class="badge-styles-content">
          <div class="badge-styles-header">
            <div class="header-left">
              <h3>标识样式管理</h3>
              <p>管理系统中可用的标识样式，编辑用户时可以一键选择</p>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="openCreateStyleDialog">
                <el-icon><Plus /></el-icon>
                新建样式
              </el-button>
            </div>
          </div>

          <div class="badge-styles-grid">
            <div
              v-for="style in badgeStyles"
              :key="style.id"
              class="badge-style-item"
              :class="{ active: selectedBadgeStyle === style.id }"
            >
              <div class="badge-item-content" @click="selectBadgeStyle(style)">
                <div class="badge-preview">
                  <div class="preview-avatar">
                    <span class="preview-avatar-text">U</span>
                    <span
                      class="preview-badge"
                      :style="{
                        backgroundColor: style.bgColor,
                        color: style.textColor
                      }"
                    >
                      {{ style.text }}
                    </span>
                  </div>
                </div>
                <div class="badge-style-info">
                  <div class="badge-style-name">{{ style.name }}</div>
                  <div class="badge-style-text">{{ style.text }}</div>
                </div>
              </div>
              <el-button
                size="small"
                type="danger"
                class="delete-button"
                @click.stop="deleteBadgeStyle(style)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editingUser ? '编辑用户' : '新建用户'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="editForm.password"
            type="password"
            :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
            show-password
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item label="用户等级" prop="level">
          <el-select v-model="editForm.level" placeholder="请选择用户等级">
            <el-option label="一级（站长）" :value="1"></el-option>
            <el-option label="二级（管理员）" :value="2"></el-option>
            <el-option label="三级（普通用户）" :value="3"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="权限分配" prop="permissions">
          <el-checkbox-group v-model="editForm.permissions">
            <el-checkbox value="category_manage">分类管理</el-checkbox>
            <el-checkbox value="announcement_manage">公告管理</el-checkbox>
            <el-checkbox value="user_manage">用户管理</el-checkbox>
            <el-checkbox value="email_send">邮件发送</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="预设样式" prop="badgeStyleId">
          <el-select v-model="editForm.badgeStyleId" placeholder="选择预设样式">
            <el-option label="无" :value="null" />
            <el-option
              v-for="style in badgeStyles"
              :key="style.id"
              :label="style.name"
              :value="style.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="头像旁单字" prop="avatarBadge">
          <el-input v-model="editForm.avatarBadge" placeholder="请输入单字" maxlength="1" />
        </el-form-item>

        <el-form-item label="背景色" prop="avatarBadgeBgColor">
          <el-color-picker v-model="editForm.avatarBadgeBgColor" />
        </el-form-item>

        <el-form-item label="文字色" prop="avatarBadgeTextColor">
          <el-color-picker v-model="editForm.avatarBadgeTextColor" />
        </el-form-item>

        <el-form-item label="是否展示" prop="showAvatarBadge">
          <el-switch v-model="editForm.showAvatarBadge" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 创建样式对话框 -->
    <el-dialog
      v-model="createStyleDialogVisible"
      title="新建标识样式"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="newStyleForm"
        label-width="100px"
      >
        <el-form-item label="样式名称" required>
          <el-input v-model="newStyleForm.name" placeholder="请输入样式名称" />
        </el-form-item>

        <el-form-item label="样式文本" required>
          <el-input v-model="newStyleForm.text" placeholder="请输入单个字符" maxlength="1" />
        </el-form-item>

        <el-form-item label="背景色">
          <el-color-picker v-model="newStyleForm.bgColor" />
        </el-form-item>

        <el-form-item label="文字色">
          <el-color-picker v-model="newStyleForm.textColor" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createStyleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createNewStyle">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑样式对话框 -->
    <el-dialog
      v-model="editStyleDialogVisible"
      title="编辑标识样式"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="currentEditStyle"
        label-width="100px"
      >
        <el-form-item label="样式名称" required>
          <el-input v-model="currentEditStyle.name" placeholder="请输入样式名称" />
        </el-form-item>

        <el-form-item label="样式文本" required>
          <el-input v-model="currentEditStyle.text" placeholder="请输入单个字符" maxlength="1" />
        </el-form-item>

        <el-form-item label="背景色">
          <el-color-picker v-model="currentEditStyle.bgColor" />
        </el-form-item>

        <el-form-item label="文字色">
          <el-color-picker v-model="currentEditStyle.textColor" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editStyleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditStyle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 用户管理页面组件
// 功能：管理员用于管理系统用户，编辑用户信息和分配权限
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import {
  getAllUsersAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  createUserAdmin
} from '@/api/users'

// 判断是否为移动端
const isMobile = computed(() => window.innerWidth < 768)

const loading = ref(false)
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const activeTab = ref('users')

const editDialogVisible = ref(false)
const editingUser = ref(null)
const editFormRef = ref(null)

// 标识样式数据
const badgeStyles = ref([
  { id: 1, name: '管理员', text: '管', bgColor: '#ff7d00', textColor: '#ffffff' },
  { id: 2, name: 'VIP用户', text: 'V', bgColor: '#165dff', textColor: '#ffffff' },
  { id: 3, name: '专家', text: '专', bgColor: '#722ed1', textColor: '#ffffff' },
  { id: 4, name: '贡献者', text: '贡', bgColor: '#00b42a', textColor: '#ffffff' }
])
const selectedBadgeStyle = ref(null)

// 创建样式对话框
const createStyleDialogVisible = ref(false)

// 编辑样式对话框
const editStyleDialogVisible = ref(false)

// 当前编辑的样式
const currentEditStyle = ref(null)

// 新样式表单
const newStyleForm = reactive({
  name: '',
  text: '',
  bgColor: '#165dff',
  textColor: '#ffffff'
})

const editForm = reactive({
  username: '',
  nickname: '',
  password: '',
  email: '',
  bio: '',
  level: 3,
  permissions: [],
  badgeStyleId: null,
  avatarBadge: '',
  avatarBadgeBgColor: '',
  avatarBadgeTextColor: '',
  showAvatarBadge: false
})

const editFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含英文、数字和下划线，长度3-20个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度应在2-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: false, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择用户等级', trigger: 'blur' }
  ]
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await getAllUsersAdmin({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchKeyword.value
    })
    users.value = res.users || []
    total.value = res.total || 0
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleAddUser = () => {
  editingUser.value = null
  Object.assign(editForm, {
    username: '',
    nickname: '',
    password: '',
    email: '',
    bio: '',
    level: 3,
    permissions: [],
    avatarBadge: '',
    avatarBadgeBgColor: '',
    avatarBadgeTextColor: '',
    showAvatarBadge: false
  })
  editDialogVisible.value = true
}

const handleEdit = (row) => {
  editingUser.value = row
  Object.assign(editForm, {
    username: row.username || '',
    nickname: row.nickname || '',
    password: '',
    email: row.email || '',
    bio: row.bio || '',
    level: row.level || 3,
    permissions: row.permissions || [],
    avatarBadge: row.avatarBadge || '',
    avatarBadgeBgColor: row.avatarBadgeBgColor || '',
    avatarBadgeTextColor: row.avatarBadgeTextColor || '',
    showAvatarBadge: row.showAvatarBadge || false
  })
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  if (!editFormRef.value) return

  try {
    // 新建用户时密码必填
    if (!editingUser.value && !editForm.password) {
      ElMessage.error('请输入密码')
      return
    }

    await editFormRef.value.validate()

    const submitData = { ...editForm }
    if (!submitData.password) {
      delete submitData.password
    }

    if (editingUser.value) {
      // 编辑用户
      await updateUserAdmin(editingUser.value.id, submitData)
      ElMessage.success('用户信息更新成功')
    } else {
      // 新增用户
      await createUserAdmin(submitData)
      ElMessage.success('用户创建成功')
    }
    editDialogVisible.value = false
    loadUsers()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '保存失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    await deleteUserAdmin(row.id)
    ElMessage.success('用户删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getLevelText = (level) => {
  const levelMap = {
    1: '一级（站长）',
    2: '二级（管理员）',
    3: '三级（普通用户）'
  }
  return levelMap[level] || '未知'
}

const getLevelType = (level) => {
  const typeMap = {
    1: 'danger',
    2: 'warning',
    3: 'info'
  }
  return typeMap[level] || 'info'
}

const getPermissionText = (permission) => {
  const permissionMap = {
    category_manage: '分类管理',
    announcement_manage: '公告管理',
    user_manage: '用户管理',
    email_send: '邮件发送'
  }
  return permissionMap[permission] || permission
}

// 选择标识样式（编辑样式）
const selectBadgeStyle = (style) => {
  selectedBadgeStyle.value = style.id
  // 设置当前编辑的样式
  currentEditStyle.value = { ...style }
  // 打开编辑样式对话框
  editStyleDialogVisible.value = true
}

// 监听预设样式选择变化
watch(() => editForm.badgeStyleId, (newValue) => {
  if (newValue) {
    const selectedStyle = badgeStyles.value.find(style => style.id === newValue)
    if (selectedStyle) {
      editForm.avatarBadge = selectedStyle.text
      editForm.avatarBadgeBgColor = selectedStyle.bgColor
      editForm.avatarBadgeTextColor = selectedStyle.textColor
      editForm.showAvatarBadge = true
    }
  } else {
    // 清空样式
    editForm.avatarBadge = ''
    editForm.avatarBadgeBgColor = ''
    editForm.avatarBadgeTextColor = ''
    editForm.showAvatarBadge = false
  }
})

// 打开创建样式对话框
const openCreateStyleDialog = () => {
  // 重置表单
  Object.assign(newStyleForm, {
    name: '',
    text: '',
    bgColor: '#165dff',
    textColor: '#ffffff'
  })
  createStyleDialogVisible.value = true
}

// 创建新样式
const createNewStyle = () => {
  if (!newStyleForm.name || !newStyleForm.text) {
    ElMessage.error('请填写样式名称和文本')
    return
  }

  if (newStyleForm.text.length > 1) {
    ElMessage.error('样式文本只能是单个字符')
    return
  }

  // 生成新ID
  const newId = Math.max(...badgeStyles.value.map(style => style.id), 0) + 1

  // 添加新样式
  badgeStyles.value.push({
    id: newId,
    name: newStyleForm.name,
    text: newStyleForm.text,
    bgColor: newStyleForm.bgColor,
    textColor: newStyleForm.textColor
  })

  ElMessage.success('样式创建成功')
  createStyleDialogVisible.value = false
}

// 保存编辑的样式
const saveEditStyle = () => {
  if (!currentEditStyle.value) return

  if (!currentEditStyle.value.name || !currentEditStyle.value.text) {
    ElMessage.error('请填写样式名称和文本')
    return
  }

  if (currentEditStyle.value.text.length > 1) {
    ElMessage.error('样式文本只能是单个字符')
    return
  }

  // 找到并更新样式
  const index = badgeStyles.value.findIndex(style => style.id === currentEditStyle.value.id)
  if (index !== -1) {
    badgeStyles.value[index] = { ...currentEditStyle.value }
    ElMessage.success('样式更新成功')
  }

  editStyleDialogVisible.value = false
}

// 删除样式
const deleteBadgeStyle = (style) => {
  ElMessageBox.confirm(
    `确定要删除样式 "${style.name}" 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 从数组中删除样式
    const index = badgeStyles.value.findIndex(s => s.id === style.id)
    if (index !== -1) {
      badgeStyles.value.splice(index, 1)
      ElMessage.success('样式删除成功')
      // 如果删除的是当前选中的样式，清空选中状态
      if (selectedBadgeStyle.value === style.id) {
        selectedBadgeStyle.value = null
      }
    }
  }).catch(() => {
    // 用户取消删除
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="scss">
  :deep(.cell) {
      overflow: visible;
    }
.user-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  margin-top: 24px;
}

.users-card {
  .tabs-section {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e6eb;
    padding-bottom: 12px;
  }

  .tab-item {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #4e5969;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(22, 93, 255, 0.05);
      color: #165dff;
    }

    &.active {
      background: #eaf2ff;
      color: #165dff;
      box-shadow: 0 2px 4px rgba(22, 93, 255, 0.1);
    }
  }

  .card-header-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  .el-table {
    margin-top: 0;

    :deep(.cell) {
      overflow: visible;
    }
  }

  .badge-styles-content {
      padding: 20px 0;

      .badge-styles-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        .header-left {
          flex: 1;

          h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1d2129;
          }

          p {
            margin: 0;
            font-size: 14px;
            color: #86909c;
          }
        }

        .header-right {
          flex-shrink: 0;
        }
      }

    .badge-styles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
    }

    .badge-style-item {
      border: 2px solid #f2f3f5;
      border-radius: 16px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      position: relative;
      background: white;

      &:hover {
        border-color: #165dff;
        box-shadow: 0 8px 24px rgba(22, 93, 255, 0.12);
        transform: translateY(-2px);
      }

      &.active {
        border-color: #165dff;
        background: #f7f8fa;
      }

      .badge-item-content {
        cursor: pointer;
      }

      .badge-preview {
        margin-bottom: 20px;

        .preview-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: 600;
          position: relative;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(22, 93, 255, 0.15);

          .preview-badge {
            position: absolute;
            bottom: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
        }
      }

      .badge-style-info {
        .badge-style-name {
          font-size: 16px;
          font-weight: 600;
          color: #1d2129;
          margin-bottom: 6px;
        }

        .badge-style-text {
          font-size: 14px;
          color: #86909c;
        }
      }

      .delete-button {
        position: absolute;
        top: 12px;
        right: 12px;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.2s ease;
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #f53f3f;
          color: white;
        }
      }

      &:hover .delete-button {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
}

/* 移动端卡片列表样式 */
.mobile-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.mobile-user-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f2f3f5;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-username {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
}

.card-detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;

  .detail-label {
    color: #86909c;
    flex-shrink: 0;
  }

  .detail-value {
    color: #4e5969;
    word-break: break-all;
  }
}

.card-actions-row {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .user-manage-page {
    padding: 16px;
  }

  .content-wrapper {
    margin-top: 16px;
  }

  .users-card {
    .el-card__body {
      padding: 0;
    }
  }

  .pagination-wrapper {
    padding: 16px;
    margin-top: 0;
  }

  .pagination-wrapper .el-pagination {
    .el-pagination__sizes,
    .el-pagination__total {
      display: none;
    }

    .el-pagination__jump {
      display: none;
    }

    .el-pagination__button {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
    }

    .el-pagination__page-btn {
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
    }
  }
}
</style>
