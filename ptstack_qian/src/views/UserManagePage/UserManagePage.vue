<template>
  <div class="user-manage-page">
    <PageHeader title="用户管理" subtitle="管理系统用户，编辑用户信息和分配权限">
      <template #actions>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名、昵称、邮箱"
          style="width: 300px; margin-right: 16px;"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </template>
    </PageHeader>

    <div class="content-wrapper">
      <el-card class="users-card">
        <el-table :data="users" v-loading="loading" stripe>
          <el-table-column prop="id" label="用户ID" width="200" show-overflow-tooltip />
          <el-table-column prop="username" label="登录账号" width="140" show-overflow-tooltip />
          <el-table-column prop="nickname" label="昵称" width="140" show-overflow-tooltip />
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column label="是否管理员" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isAdmin ? 'success' : 'info'">
                {{ row.isAdmin ? '是' : '否' }}
              </el-tag>
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
      </el-card>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="editingUser ? '编辑用户' : '新建用户'"
      width="600px"
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
            placeholder="留空则不修改密码"
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

        <el-form-item label="管理员权限" prop="is_admin">
          <el-switch v-model="editForm.is_admin" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import {
  getAllUsersAdmin,
  updateUserAdmin,
  deleteUserAdmin
} from '@/api/users'

const loading = ref(false)
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')

const editDialogVisible = ref(false)
const editingUser = ref(null)
const editFormRef = ref(null)

const editForm = reactive({
  username: '',
  nickname: '',
  password: '',
  email: '',
  bio: '',
  is_admin: false
})

const editFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含英文、数字和下划线，长度3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { validator: (rule, value, callback) => {
      if (editingUser.value && !value) {
        callback()
      } else if (value && value.length < 6) {
        callback(new Error('密码长度不能少于6个字符'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
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
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleEdit = (row) => {
  editingUser.value = row
  Object.assign(editForm, {
    username: row.username || '',
    nickname: row.nickname || '',
    password: '',
    email: row.email || '',
    bio: row.bio || '',
    is_admin: row.isAdmin || false
  })
  editDialogVisible.value = true
}

const handleSaveEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    const updateData = { ...editForm }
    if (!updateData.password) {
      delete updateData.password
    }
    
    await updateUserAdmin(editingUser.value.id, updateData)
    ElMessage.success('用户信息更新成功')
    editDialogVisible.value = false
    loadUsers()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '更新失败')
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

onMounted(() => {
  loadUsers()
})
</script>

<style scoped lang="scss">
.user-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-wrapper {
  margin-top: 24px;
}

.users-card {
  .el-table {
    margin-top: 16px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e6eb;
}
</style>
