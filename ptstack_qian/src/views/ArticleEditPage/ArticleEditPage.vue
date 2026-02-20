<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticleById, createArticle, updateArticle, getCategories, getTags, applyCategory } from '@/api/articles'
import { Check, Setting, Plus, Document, DocumentAdd, ArrowLeft } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import { ElMessage } from 'element-plus'
import { MdEditor, NormalToolbar } from 'md-editor-v3'

const router = useRouter()
const route = useRoute()

const isEdit = ref(!!route.params.id)
const loading = ref(false)
const saving = ref(false)
const savingDraft = ref(false)
const editorRef = ref(null)
const toolbars = ['bold', 'underline', 'italic', '-', 'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 0, '-', 'revoke', 'next', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog']

const insertIndent = () => {
  formData.value.content += '&emsp;'
}

const formData = ref({
  title: '',
  content: '',
  category_id: '',
  tags: [],
  summary: '',
  cover: '',
  status: 1
})

const categories = ref([])
const allTags = ref([])
const newTagInput = ref('')

const applyDialogVisible = ref(false)
const applyFormData = ref({
  name: '',
  description: ''
})
const applying = ref(false)

const fetchArticle = async () => {
  if (!isEdit.value) return
  try {
    loading.value = true
    const res = await getArticleById(route.params.id)
    formData.value = {
      title: res.title,
      content: res.content,
      category_id: res.category_id,
      tags: (res.tags || []).map(tag => typeof tag === 'object' ? tag.name : tag),
      summary: res.summary,
      cover: res.cover,
      status: res.status
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    ElMessage.error('获取文章失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchTags = async () => {
  try {
    const res = await getTags()
    allTags.value = res
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const addTag = () => {
  if (!newTagInput.value.trim()) return
  if (!formData.value.tags.includes(newTagInput.value.trim())) {
    formData.value.tags.push(newTagInput.value.trim())
  }
  newTagInput.value = ''
}

const removeTag = (tag) => {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  }
}

const openApplyDialog = () => {
  applyFormData.value = {
    name: '',
    description: ''
  }
  applyDialogVisible.value = true
}

const handleApply = async () => {
  if (!applyFormData.value.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  try {
    applying.value = true
    await applyCategory(applyFormData.value)
    ElMessage.success('分类申请提交成功，请等待审核')
    applyDialogVisible.value = false
    fetchCategories()
  } catch (error) {
    console.error('申请失败:', error)
    ElMessage.error(error.response?.data?.message || '申请失败，请稍后重试')
  } finally {
    applying.value = false
  }
}

const handleSubmit = async (saveAsDraft = false) => {
  if (!saveAsDraft) {
    if (!formData.value.title.trim()) {
      ElMessage.warning('请输入文章标题')
      return
    }
    if (!formData.value.content.trim()) {
      ElMessage.warning('请输入文章内容')
      return
    }
  }

  formData.value.status = saveAsDraft ? 0 : 1

  try {
    if (saveAsDraft) {
      savingDraft.value = true
    } else {
      saving.value = true
    }

    if (isEdit.value) {
      await updateArticle(route.params.id, formData.value)
      ElMessage.success(saveAsDraft ? '草稿保存成功' : '文章更新成功')
    } else {
      await createArticle(formData.value)
      ElMessage.success(saveAsDraft ? '草稿保存成功' : '文章发布成功')
    }

    if (!saveAsDraft) {
      router.push('/articles')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
    savingDraft.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchArticle()
  fetchCategories()
  fetchTags()
})
</script>

<template>
  <div class="article-edit-page" v-loading="loading">
    <div class="back-section">
      <el-button text @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>
    <div class="edit-container">
      <div class="main-content">
        <div class="form-card">
          <div class="form-section">
            <label class="form-label">文章标题</label>
            <el-input
              v-model="formData.title"
              placeholder="请输入文章标题（建议20-100字）"
              size="large"
              class="title-input"
            />
          </div>

          <div class="form-section">
            <label class="form-label">文章内容</label>
            <MdEditor
              ref="editorRef"
              v-model="formData.content"
              placeholder="开始编写你的技术文章..."
              :editorId="'article-editor'"
              :toolbars="toolbars"
              style="height: 600px"
            >
              <template #defToolbars>
                <NormalToolbar title="插入缩进" @onClick="insertIndent">
                  ↦
                </NormalToolbar>
              </template>
            </MdEditor>
          </div>

          <div class="form-section">
            <label class="form-label">文章摘要</label>
            <el-input
              v-model="formData.summary"
              type="textarea"
              :rows="3"
              placeholder="简要描述文章内容（可选，会自动从内容中提取）"
              class="summary-textarea"
            />
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="side-card">
          <div class="card-title">
            <el-icon><Setting /></el-icon>
            文章设置
          </div>

          <div class="form-section">
            <div class="category-label-row">
              <label class="form-label">文章分类</label>
              <el-button
                text
                size="small"
                @click="openApplyDialog"
                class="apply-category-btn"
              >
                <el-icon><DocumentAdd /></el-icon>
                申请新分类
              </el-button>
            </div>
            <el-select
              v-model="formData.category_id"
              placeholder="选择分类"
              size="large"
              class="category-select"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </div>

          <div class="form-section">
            <label class="form-label">文章标签</label>
            <div class="tags-container">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="form-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="add-tag-row">
              <el-input
                v-model="newTagInput"
                placeholder="添加标签"
                size="large"
                @keyup.enter="addTag"
                class="tag-input"
              >
                <template #append>
                  <el-button @click="addTag">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
            <div class="tag-suggestions" v-if="allTags.length > 0">
              <p class="suggestion-title">推荐标签：</p>
              <div class="suggestion-tags">
                <el-tag
                  v-for="tag in allTags.filter(t => !formData.tags.includes(t.name)).slice(0, 10)"
                  :key="tag.id"
                  size="small"
                  @click="formData.tags.push(tag.name)"
                  class="suggestion-tag"
                >
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">封面图片</label>
            <el-input
              v-model="formData.cover"
              placeholder="输入图片URL（可选）"
              size="large"
              class="cover-input"
            />
            <div class="cover-preview" v-if="formData.cover">
              <img :src="formData.cover" alt="封面预览" />
            </div>
          </div>

          <div class="action-buttons">
            <el-button @click="goBack" size="large" class="action-btn">
              取消
            </el-button>
            <el-button size="large" @click="handleSubmit(true)" :loading="savingDraft" class="action-btn">
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button type="primary" size="large" @click="handleSubmit(false)" :loading="saving" class="submit-btn">
              <el-icon><Check /></el-icon>
              {{ isEdit ? '更新文章' : '发布文章' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="applyDialogVisible"
      title="申请创建分类"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="applyFormData" label-width="80px">
        <el-form-item label="分类名称">
          <el-input
            v-model="applyFormData.name"
            placeholder="请输入分类名称"
            size="large"
          />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="applyFormData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述（可选）"
            size="large"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApply" :loading="applying">
          提交申请
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.article-edit-page {
  min-height: 100%;
  background: #f7f8fa;
  padding: 24px;
}

.back-section {
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  padding: 16px 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4e5969;
  font-size: 14px;
  padding: 0;

  &:hover {
    color: #165dff;
  }
}

.edit-container {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  min-width: 0;
}

.form-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 12px;
}



.category-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    font-size: 18px;
  }
}

.summary-textarea {
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    font-size: 15px;
    line-height: 1.7;
    resize: vertical;
    font-family: 'Fira Code', 'Consolas', monospace;
  }
}

.sidebar {
  min-width: 0;
}

.side-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.category-select,
.cover-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 10px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 32px;
}

.form-tag {
  margin: 0;
}

.tag-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px 0 0 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 10px 16px;
  }

  :deep(.el-input-group__append) {
    border-radius: 0 8px 8px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: none;
  }
}

.tag-suggestions {
  margin-top: 16px;
}

.suggestion-title {
  font-size: 13px;
  color: #86909c;
  margin: 0 0 8px 0;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(22, 93, 255, 0.1);
    color: #165dff;
  }
}

.cover-preview {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;
}

.action-btn {
  width: 100%;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
}

@media (max-width: 992px) {
  .edit-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }

  .main-content {
    order: 1;
  }

  .side-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .article-edit-page {
    padding: 16px;
  }

  .form-card {
    padding: 20px;
  }
}
</style>
