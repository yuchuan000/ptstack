<script setup>
// 导入Vue的ref和onMounted函数
import { ref, onMounted } from 'vue'
// 导入分类相关的API函数
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/articles'
// 导入Element Plus图标组件
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
// 导入页面标题组件
import PageHeader from '@/components/PageHeader/PageHeader.vue'

// 加载状态标识
const loading = ref(false)
// 分类列表数据
const categories = ref([])
// 对话框是否可见
const dialogVisible = ref(false)
// 是否为编辑模式
const isEdit = ref(false)
// 当前正在编辑的分类
const currentCategory = ref(null)
// 表单数据
const formData = ref({
  name: '', // 分类名称
  description: '' // 分类描述
})

// 获取分类列表的异步函数
const fetchCategories = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 调用API获取分类列表
    categories.value = await getCategories()
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取分类失败:', error)
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 打开创建分类对话框的函数
const openCreateDialog = () => {
  // 设置为非编辑模式
  isEdit.value = false
  // 清空当前分类
  currentCategory.value = null
  // 重置表单数据
  formData.value = {
    name: '', // 清空分类名称
    description: '' // 清空分类描述
  }
  // 显示对话框
  dialogVisible.value = true
}

// 打开编辑分类对话框的函数
const openEditDialog = (category) => {
  // 设置为编辑模式
  isEdit.value = true
  // 保存当前正在编辑的分类
  currentCategory.value = category
  // 填充表单数据
  formData.value = {
    name: category.name, // 分类名称
    description: category.description || '' // 分类描述，如果为空则用空字符串
  }
  // 显示对话框
  dialogVisible.value = true
}

// 提交表单的异步函数
const handleSubmit = async () => {
  // 如果分类名称为空，显示提示并返回
  if (!formData.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    // 如果是编辑模式
    if (isEdit.value) {
      // 调用API更新分类
      await updateCategory(currentCategory.value.id, formData.value)
      // 显示成功提示
      ElMessage.success('分类更新成功')
    } else {
      // 调用API创建分类
      await createCategory(formData.value)
      // 显示成功提示
      ElMessage.success('分类创建成功')
    }
    // 关闭对话框
    dialogVisible.value = false
    // 重新获取分类列表
    fetchCategories()
  } catch (error) {
    // 在控制台输出错误信息
    console.error('保存失败:', error)
  }
}

// 删除分类的函数
const handleDelete = (category) => {
  // 显示确认对话框
  ElMessageBox.confirm(
    `确定要删除分类「${category.name}」吗？`, // 确认消息
    '提示', // 标题
    {
      confirmButtonText: '确定', // 确认按钮文本
      cancelButtonText: '取消', // 取消按钮文本
      type: 'warning', // 对话框类型
    }
  ).then(async () => {
    // 点击确认按钮后的处理
    try {
      // 调用API删除分类
      await deleteCategory(category.id)
      // 显示成功提示
      ElMessage.success('分类删除成功')
      // 重新获取分类列表
      fetchCategories()
    } catch (error) {
      // 在控制台输出错误信息
      console.error('删除失败:', error)
    }
  }).catch(() => {}) // 点击取消按钮，不做任何操作
}

// 组件挂载时的生命周期钩子
onMounted(() => {
  // 获取分类列表
  fetchCategories()
})
</script>

<template>
  <div class="category-manage-page">
    <PageHeader title="分类管理" subtitle="管理文章分类和描述">
      <template #actions>
        <el-button type="primary" size="large" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建分类
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="categories-container" v-loading="loading">
      <div class="category-grid">
        <div class="category-card" v-for="category in categories" :key="category.id">
          <div class="category-icon">
            <span>{{ category.name.charAt(0) }}</span>
          </div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc" v-if="category.description">{{ category.description }}</p>
            <p class="category-desc empty" v-else>暂无描述</p>
          </div>
          <div class="category-actions">
            <el-button circle size="small" @click="openEditDialog(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button circle size="small" type="danger" @click="handleDelete(category)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

        <el-empty v-if="categories.length === 0 && !loading" description="暂无分类" />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新建分类'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="分类名称">
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称"
            size="large"
          />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述（可选）"
            size="large"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.category-manage-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.content-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.categories-container {
  min-height: 400px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.category-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  span {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
  }
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 6px 0;
}

.category-desc {
  font-size: 14px;
  color: #86909c;
  line-height: 1.6;
  margin: 0;

  &.empty {
    color: #c9cdd4;
    font-style: italic;
  }
}

.category-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  .category-card:hover & {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-btn {
    width: 100%;
  }
}
</style>
