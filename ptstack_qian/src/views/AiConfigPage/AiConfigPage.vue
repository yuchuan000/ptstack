<template>
  <div class="ai-config-page">
    <PageHeader title="AI管理" subtitle="配置AI服务提供商" />

    <div class="content-card">
      <!-- 操作栏 -->
      <div class="section-header">
        <div class="header-actions">
          <el-button type="primary" @click="handleInit">
            <el-icon><Refresh /></el-icon>
            初始化默认配置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增AI配置
          </el-button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="tabs-section">
        <div
          class="tab-item"
          :class="{ active: filterProvider === '' }"
          @click="filterProvider = ''"
        >
          全部
        </div>
        <div
          v-for="option in providerOptions"
          :key="option.value"
          class="tab-item"
          :class="{ active: filterProvider === option.value }"
          @click="filterProvider = option.value"
        >
          {{ option.label }}
        </div>
      </div>

      <!-- AI配置列表 -->
      <div v-loading="loading" class="ai-provider-list">
        <el-empty v-if="filteredProviders.length === 0" description="暂无AI配置" />

        <div class="provider-grid">
          <div
            v-for="provider in filteredProviders"
            :key="provider.id"
            class="provider-card"
            :class="{ disabled: !provider.isEnabled }"
          >
            <div class="provider-header">
              <div class="provider-info">
                <div class="provider-name-row">
                  <h4 class="provider-name">{{ provider.name }}</h4>
                  <el-tag :type="provider.isEnabled ? 'success' : 'info'" size="small">
                    {{ provider.isEnabled ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
                <div class="provider-tags">
                  <el-tag type="info" size="small">
                    {{ getProviderText(provider.provider) }}
                  </el-tag>
                  <el-tag
                    :type="provider.aiType === 'chat' ? 'primary' : 'warning'"
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ getAiTypeText(provider.aiType) }}
                  </el-tag>
                  <el-tag
                    v-if="provider.priority > 0"
                    type="danger"
                    size="small"
                    style="margin-left: 8px"
                  >
                    优先级: {{ provider.priority }}
                  </el-tag>
                </div>
              </div>
              <div class="provider-actions">
                <el-switch
                  v-model="provider.isEnabled"
                  @change="(val) => handleToggleStatus(provider, val)"
                />
              </div>
            </div>

            <el-divider />

            <div class="provider-details">
              <div class="detail-item">
                <span class="detail-label">API地址:</span>
                <span class="detail-value">{{ provider.apiUrl }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">模型ID:</span>
                <span class="detail-value">{{ provider.modelId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">API密钥:</span>
                <span class="detail-value encrypted">{{
                  provider.apiKey ? '********' : '未设置'
                }}</span>
              </div>
              <div v-if="provider.description" class="detail-item">
                <span class="detail-label">描述:</span>
                <span class="detail-value">{{ provider.description }}</span>
              </div>
            </div>

            <div class="provider-footer">
              <el-button type="primary" size="small" @click="handleEdit(provider)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(provider)"
                style="margin-left: 8px"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑AI配置' : '新增AI配置'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="AI名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入AI名称，如：豆包-总结-1" />
        </el-form-item>

        <el-form-item label="厂商" prop="provider">
          <el-select v-model="form.provider" placeholder="请选择AI厂商">
            <el-option label="OpenAI" value="openai" />
            <el-option label="豆包" value="doubao" />
          </el-select>
        </el-form-item>

        <el-form-item label="AI类型" prop="aiType">
          <el-radio-group v-model="form.aiType" @change="handleAiTypeChange">
            <el-radio-button label="chat">语言模型</el-radio-button>
            <el-radio-button label="image">图片模型</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用途" prop="purpose">
          <el-radio-group v-model="form.purpose">
            <el-radio-button label="summary" :disabled="form.aiType === 'image'"
              >生成总结</el-radio-button
            >
            <el-radio-button label="cover" :disabled="form.aiType === 'chat'"
              >生成封面</el-radio-button
            >
          </el-radio-group>
          <div class="form-tip">
            {{ form.aiType === 'chat' ? '语言模型只能用于生成总结' : '图片模型只能用于生成封面' }}
          </div>
        </el-form-item>

        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入API地址" />
        </el-form-item>

        <el-form-item label="模型ID" prop="modelId">
          <el-input v-model="form.modelId" placeholder="请输入模型ID" />
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="请输入API密钥"
          />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="form.priority" :min="0" :max="100" />
          <div class="form-tip">数字越小优先级越高，0为最高优先级</div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述信息（可选）"
          />
        </el-form-item>

        <el-form-item label="厂商配置" prop="config">
          <el-input
            v-model="form.config"
            type="textarea"
            :rows="3"
            placeholder="请输入厂商特定配置（JSON格式，可选）"
          />
          <div class="form-tip">例如：{"temperature": 0.7, "max_tokens": 300}</div>
        </el-form-item>

        <el-form-item label="启用状态" prop="isEnabled">
          <el-switch v-model="form.isEnabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import {
  getAiProviders,
  initDefaultAiProviders,
  createAiProvider,
  updateAiProvider,
  deleteAiProvider,
  toggleAiProviderStatus,
} from '@/api/aiConfig'

const providers = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const filterProvider = ref('')
const form = ref({
  name: '',
  provider: 'doubao',
  apiKey: '',
  apiUrl: '',
  modelId: '',
  aiType: 'chat',
  purpose: 'summary',
  isEnabled: true,
  priority: 0,
  config: '',
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入AI名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择AI厂商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  modelId: [{ required: true, message: '请输入模型ID', trigger: 'blur' }],
  aiType: [{ required: true, message: '请选择AI类型', trigger: 'change' }],
  purpose: [{ required: true, message: '请选择用途', trigger: 'change' }],
}

const filteredProviders = computed(() => {
  return providers.value.filter((provider) => {
    if (filterProvider.value && provider.provider !== filterProvider.value) {
      return false
    }
    return true
  })
})

const providerOptions = computed(() => {
  const uniqueProviders = [...new Set(providers.value.map((p) => p.provider))]
  return uniqueProviders.map((provider) => ({
    value: provider,
    label: getProviderText(provider),
  }))
})

const getAiTypeText = (type) => {
  const map = {
    chat: '语言模型',
    image: '图片模型',
  }
  return map[type] || type
}

const getProviderText = (provider) => {
  const map = {
    openai: 'OpenAI',
    doubao: '豆包',
  }
  return map[provider] || provider
}

const fetchProviders = async () => {
  loading.value = true
  try {
    const res = await getAiProviders()
    providers.value = res.providers || []
  } catch {
    ElMessage.error('获取AI配置失败')
  } finally {
    loading.value = false
  }
}

const handleInit = async () => {
  try {
    await ElMessageBox.confirm('确定要初始化默认AI配置吗？已存在的配置不会被覆盖。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await initDefaultAiProviders()
    ElMessage.success('初始化成功')
    fetchProviders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('初始化失败')
    }
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    provider: 'doubao',
    apiKey: '',
    apiUrl: '',
    modelId: '',
    aiType: 'chat',
    purpose: 'summary',
    isEnabled: true,
    priority: 0,
    config: '',
    description: '',
  }
  dialogVisible.value = true
}

const handleEdit = (provider) => {
  isEdit.value = true
  const formData = { ...provider }
  // 处理config字段，确保是字符串
  if (formData.config) {
    formData.config = JSON.stringify(formData.config, null, 2)
  } else {
    formData.config = ''
  }
  form.value = formData
  dialogVisible.value = true
}

const handleAiTypeChange = (val) => {
  if (val === 'chat') {
    form.value.purpose = 'summary'
  } else {
    form.value.purpose = 'cover'
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    // 处理config字段，确保是JSON对象
    const formData = { ...form.value }
    if (formData.config) {
      try {
        formData.config = JSON.parse(formData.config)
      } catch {
        ElMessage.error('厂商配置格式错误，请输入有效的JSON')
        return
      }
    } else {
      formData.config = null
    }

    if (isEdit.value) {
      await updateAiProvider(form.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createAiProvider(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchProviders()
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '操作失败')
  }
}

const handleDelete = async (provider) => {
  try {
    await ElMessageBox.confirm(`确定要删除 "${provider.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteAiProvider(provider.id)
    ElMessage.success('删除成功')
    fetchProviders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleStatus = async (provider, isEnabled) => {
  try {
    await toggleAiProviderStatus(provider.id, isEnabled)
    ElMessage.success(isEnabled ? '已启用' : '已禁用')
  } catch {
    provider.isEnabled = !isEnabled
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchProviders()
})
</script>

<style scoped lang="scss">
.ai-config-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;

  .header-actions {
    display: flex;
    gap: 10px;

    .el-button {
      font-size: 14px;
      padding: 8px 16px;

      &.el-button--primary {
        background-color: #165dff;
        border-color: #165dff;
      }

      &.el-button--success {
        background-color: #67c23a;
        border-color: #67c23a;
      }
    }
  }
}

.tabs-section {
  display: flex;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e6eb;
  margin-bottom: 24px;
}

.tab-item {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(22, 93, 255, 0.05);
    color: #165dff;
  }

  &.active {
    background: #eaf2ff;
    color: #165dff;
  }
}

.ai-provider-list {
  margin-top: 20px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.provider-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #165dff;
  }

  &.disabled {
    opacity: 0.7;
    background: #f9f9f9;
  }
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.provider-info {
  flex: 1;
}

.provider-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.provider-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.provider-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.provider-actions {
  display: flex;
  align-items: center;
}

.provider-details {
  margin: 16px 0;

  .detail-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .detail-label {
    width: 80px;
    color: #909399;
    flex-shrink: 0;
  }

  .detail-value {
    flex: 1;
    color: #606266;
    word-break: break-all;

    &.encrypted {
      color: #909399;
      font-style: italic;
    }
  }
}

.provider-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  gap: 10px;
}

.provider-footer .el-button {
  font-size: 14px;
  padding: 6px 12px;
}

.provider-footer .el-button--primary {
  background-color: #165dff;
  border-color: #165dff;
}

.provider-footer .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .ai-config-page {
    padding: 10px;
  }

  .content-card {
    padding: 16px;
  }

  .provider-grid {
    grid-template-columns: 1fr;
  }

  .provider-header {
    flex-direction: column;
    gap: 12px;
  }

  .provider-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
