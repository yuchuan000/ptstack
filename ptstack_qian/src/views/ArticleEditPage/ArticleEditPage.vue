<script setup>
// 文章编辑页面组件
// 功能：创建和编辑文章，支持Markdown编辑和AI生成摘要
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getArticleById,
  createArticle,
  updateArticle,
  getCategories,
  getTags,
  applyCategory,
} from '@/api/articles'
import { generateSummary, generateCover } from '@/api/ai'
import {
  Check,
  Setting,
  Plus,
  Document,
  DocumentAdd,
  ArrowLeft,
  MagicStick,
  Upload,
  Delete,
  Download,
} from '@element-plus/icons-vue'
import { ElMessage, ElUpload } from 'element-plus'
import { MdEditor, NormalToolbar } from 'md-editor-v3'
import { encodeMarkdownCodeBlocks, decodeMarkdownCodeBlocks } from '@/utils/markdownCodeBlock'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

const isEdit = ref(!!route.params.id)
const loading = ref(false)
const saving = ref(false)
const savingDraft = ref(false)
const editorRef = ref(null)
const toolbars = [
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  0,
  '-',
  'revoke',
  'next',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog',
]

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
  status: 1,
  visibility: 1,
})

const categories = ref([])
const allTags = ref([])
const newTagInput = ref('')

const applyDialogVisible = ref(false)
const applyFormData = ref({
  name: '',
  description: '',
})
const applying = ref(false)

const fetchArticle = async () => {
  if (!isEdit.value) return
  try {
    loading.value = true
    const res = await getArticleById(route.params.id)
    formData.value = {
      title: res.title || '',
      content: decodeMarkdownCodeBlocks(res.content || ''),
      category_id: res.category_id || '',
      tags: (res.tags || []).map((tag) => (typeof tag === 'object' ? tag.name : tag)),
      summary: res.summary || '',
      cover: res.cover || '',
      status: res.status !== undefined ? res.status : 1,
      visibility: res.status === 2 ? 2 : 1,
    }
    // 保存原始封面URL，用于判断是否需要删除旧文件
    originalCoverUrl.value = res.cover || ''
    // 加载附件信息
    if (res.attachments && Array.isArray(res.attachments)) {
      attachments.value = res.attachments.map((attachment) => ({
        id: attachment.id,
        originalName: attachment.originalName,
        url: attachment.url,
        size: attachment.size,
      }))
    }
  } catch (error) {
    console.error('获取文章失败:', error)
    ElMessage.error(error.response?.data?.message || '获取文章失败')
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
    description: '',
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
    if (!formData.value.category_id) {
      ElMessage.warning('请选择文章分类')
      return
    }
  }

  if (saveAsDraft) {
    formData.value.status = 0
  } else {
    formData.value.status = formData.value.visibility === 2 ? 2 : 1
  }

  try {
    if (saveAsDraft) {
      savingDraft.value = true
    } else {
      saving.value = true
    }

    let articleId = route.params.id

    // 如果是新建文章，先保存文章获取ID
    if (!isEdit.value) {
      const submitData = {
        ...formData.value,
        content: encodeMarkdownCodeBlocks(formData.value.content),
      }
      const res = await createArticle(submitData)
      articleId = res.id
    }

    // 上传待上传的封面图片
    let coverUrl = formData.value.cover
    if (pendingCoverFile.value) {
      const coverFormData = new FormData()
      coverFormData.append('image', pendingCoverFile.value)
      coverFormData.append('originalCoverUrl', originalCoverUrl.value) // 传递原始封面URL

      const coverResponse = await request.post('/upload/cover', coverFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      coverUrl = coverResponse.url
      pendingCoverFile.value = null
      // 更新原始封面URL为新的URL
      originalCoverUrl.value = coverUrl
    }

    // 上传待上传的附件
    const pendingFiles = attachments.value.filter((attach) => attach.isPending)
    for (const attach of pendingFiles) {
      const formData = new FormData()
      formData.append('attachment', attach.file)
      formData.append('articleId', articleId)

      const response = await request.post('/upload/article/attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // 更新附件信息
      attach.url = response.url
      attach.isPending = false
      delete attach.file
    }

    // 保存或更新文章
    const submitData = {
      ...formData.value,
      content: encodeMarkdownCodeBlocks(formData.value.content),
      cover: coverUrl,
    }

    if (isEdit.value) {
      await updateArticle(route.params.id, submitData)
      ElMessage.success(saveAsDraft ? '草稿保存成功' : '文章发布成功')
    } else if (!saveAsDraft) {
      // 新建文章已在上面保存
      ElMessage.success('文章发布成功')
    }

    if (!saveAsDraft) {
      router.push('/admin/articles')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
    savingDraft.value = false
  }
}

const goBack = () => {
  router.back()
}

const generatingSummary = ref(false)
const lastGenerateTime = ref(0)
const generatingCover = ref(false)
const lastGenerateCoverTime = ref(0)
const attachments = ref([])
const uploading = ref(false)
const attachmentLink = ref('')
const uploadingCover = ref(false)
const handleGenerateSummary = async () => {
  if (!formData.value.content || formData.value.content.trim().length === 0) {
    ElMessage.warning('请先输入文章内容')
    return
  }

  const now = Date.now()
  const timeSinceLastGenerate = now - lastGenerateTime.value
  if (timeSinceLastGenerate < 60000) {
    const remainingSeconds = Math.ceil((60000 - timeSinceLastGenerate) / 1000)
    ElMessage.warning(`请稍候，${remainingSeconds}秒后可再次生成摘要`)
    return
  }

  try {
    generatingSummary.value = true
    lastGenerateTime.value = now
    const res = await generateSummary({
      title: formData.value.title,
      content: encodeMarkdownCodeBlocks(formData.value.content),
    })
    formData.value.summary = res.summary
    ElMessage.success('摘要生成成功')
  } catch (error) {
    console.error('生成摘要失败:', error)
    ElMessage.error(error.response?.data?.message || '生成摘要失败，请稍后重试')
  } finally {
    generatingSummary.value = false
  }
}

const handleGenerateCover = async () => {
  if (!formData.value.title || formData.value.title.trim().length === 0) {
    ElMessage.warning('请先输入文章标题')
    return
  }

  const now = Date.now()
  const timeSinceLastGenerate = now - lastGenerateCoverTime.value
  if (timeSinceLastGenerate < 60000) {
    const remainingSeconds = Math.ceil((60000 - timeSinceLastGenerate) / 1000)
    ElMessage.warning(`请稍候，${remainingSeconds}秒后可再次生成封面`)
    return
  }

  try {
    generatingCover.value = true
    lastGenerateCoverTime.value = now
    const res = await generateCover({
      title: formData.value.title,
      content: encodeMarkdownCodeBlocks(formData.value.content),
      size: '2048x2048',
    })
    formData.value.cover = res.imageUrl
    ElMessage.success('封面生成成功')
  } catch (error) {
    console.error('生成封面失败:', error)
    ElMessage.error(error.response?.data?.message || '生成封面失败，请稍后重试')
  } finally {
    generatingCover.value = false
  }
}

// 封面图片预上传 - 暂存文件，保存时才真正上传
const pendingCoverFile = ref(null)
const originalCoverUrl = ref('') // 保存原始封面URL，用于判断是否需要删除旧文件

const handleUploadCover = async (file) => {
  // 预上传：创建本地预览URL，暂存文件对象
  const previewUrl = URL.createObjectURL(file)
  formData.value.cover = previewUrl
  pendingCoverFile.value = file
  ElMessage.success('封面已添加到待上传列表，保存后生效')
}

const handleUploadAttachment = async (file) => {
  if (attachments.value.length >= 5) {
    ElMessage.warning('最多只能添加5个附件')
    return false
  }

  // 预上传：将文件暂存，不立即上传到服务器
  attachments.value.push({
    id: Date.now(),
    originalName: file.name,
    size: file.size,
    file: file, // 暂存文件对象
    isPending: true, // 标记为待上传
  })
  ElMessage.success('附件已添加到待上传列表')
  return true
}

const handleRemoveAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const handleAddAttachmentByLink = () => {
  const link = attachmentLink.value.trim()
  if (!link) {
    ElMessage.warning('请输入附件链接')
    return
  }
  if (attachments.value.length >= 5) {
    ElMessage.warning('最多只能添加5个附件')
    return
  }
  // 从链接中提取文件名
  const url = new URL(link)
  const pathname = url.pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || '附件'
  // 添加到附件列表
  attachments.value.push({
    id: Date.now(),
    originalName: filename,
    url: link,
    size: 0, // 链接附件无法获取大小
    isExternal: true, // 标记为外部链接
  })
  attachmentLink.value = ''
  ElMessage.success('附件链接添加成功')
}

const getFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                <NormalToolbar title="插入缩进" @onClick="insertIndent"> ↦ </NormalToolbar>
              </template>
            </MdEditor>
          </div>

          <div class="form-section">
            <div class="summary-label-row">
              <label class="form-label">文章摘要</label>
              <el-button
                type="primary"
                size="small"
                :loading="generatingSummary"
                @click="handleGenerateSummary"
                class="generate-summary-btn"
              >
                <el-icon><MagicStick /></el-icon>
                AI生成
              </el-button>
            </div>
            <el-input
              v-model="formData.summary"
              type="textarea"
              :rows="3"
              placeholder="简要描述文章内容（可选，会自动从内容中提取）"
              class="summary-textarea"
            />
          </div>

          <div class="form-section">
            <div class="attachment-label-row">
              <label class="form-label">文章附件</label>
              <el-upload
                class="attachment-upload"
                :auto-upload="false"
                :on-change="(file) => handleUploadAttachment(file.raw)"
                :limit="5"
                :disabled="!isEdit"
                :show-file-list="false"
              >
                <el-button type="primary" size="small" :loading="uploading" class="upload-btn">
                  <el-icon><Upload /></el-icon>
                  上传附件
                </el-button>
              </el-upload>
            </div>
            <div class="attachment-actions">
              <div class="attachment-link-input">
                <el-input
                  v-model="attachmentLink"
                  placeholder="输入附件链接（支持第三方网盘链接）"
                  size="large"
                  @keyup.enter="handleAddAttachmentByLink"
                >
                  <template #append>
                    <el-button @click="handleAddAttachmentByLink">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="upload-tip">
              支持上传
              PDF、Word、Excel、PPT、图片、压缩包等文件，单个文件不超过20MB，最多上传5个附件
            </div>
            <div class="attachments-list" v-if="attachments.length > 0">
              <div
                v-for="(attachment, index) in attachments"
                :key="attachment.id"
                class="attachment-item"
              >
                <div class="attachment-info">
                  <el-icon class="attachment-icon"><Download /></el-icon>
                  <span class="attachment-name">{{ attachment.originalName }}</span>
                  <span class="attachment-size">{{ getFileSize(attachment.size) }}</span>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleRemoveAttachment(index)"
                  class="remove-attachment-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
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
            <div class="category-header-row">
              <label class="form-label">文章分类</label>
              <el-button text size="small" @click="openApplyDialog" class="apply-category-btn">
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
            <label class="form-label">可见性</label>
            <el-radio-group v-model="formData.visibility" size="large" class="visibility-radio">
              <el-radio :value="1">
                <div class="radio-content">
                  <div class="radio-title">公开</div>
                  <div class="radio-desc">所有人可见</div>
                </div>
              </el-radio>
              <el-radio :value="2">
                <div class="radio-content">
                  <div class="radio-title">私密</div>
                  <div class="radio-desc">仅自己可见</div>
                </div>
              </el-radio>
            </el-radio-group>
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
                  v-for="tag in allTags.filter((t) => !formData.tags.includes(t.name)).slice(0, 10)"
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
            <div class="cover-label-row">
              <label class="form-label">封面图片</label>
              <div class="cover-actions">
                <el-upload
                  class="cover-upload"
                  :auto-upload="false"
                  :on-change="(file) => handleUploadCover(file.raw)"
                  :show-file-list="false"
                  accept="image/*"
                >
                  <el-button
                    type="primary"
                    size="small"
                    :loading="uploadingCover"
                    class="upload-cover-btn"
                  >
                    <el-icon><Upload /></el-icon>
                    上传图片
                  </el-button>
                </el-upload>
                <el-button
                  type="primary"
                  size="small"
                  :loading="generatingCover"
                  @click="handleGenerateCover"
                  class="generate-cover-btn"
                >
                  <el-icon><MagicStick /></el-icon>
                  AI生成
                </el-button>
              </div>
            </div>
            <el-input
              v-model="formData.cover"
              placeholder="输入图片URL或上传图片（可选）"
              size="large"
              class="cover-input"
            />
            <div class="cover-preview" v-if="formData.cover">
              <img :src="formData.cover" alt="封面预览" />
            </div>
          </div>

          <div class="action-buttons">
            <el-button @click="goBack" size="large" class="action-btn"> 取消 </el-button>
            <el-button
              size="large"
              @click="handleSubmit(true)"
              :loading="savingDraft"
              class="action-btn"
            >
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="handleSubmit(false)"
              :loading="saving"
              class="submit-btn"
            >
              <el-icon><Check /></el-icon>
              {{ isEdit ? '发布' : '发布文章' }}
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
          <el-input v-model="applyFormData.name" placeholder="请输入分类名称" size="large" />
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
        <el-button type="primary" @click="handleApply" :loading="applying"> 提交申请 </el-button>
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

.summary-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cover-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cover-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-upload {
  display: inline-block;
}

.upload-cover-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.attachment-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.attachment-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.attachment-link-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 10px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :deep(.el-input-group__append) {
    border-radius: 0 8px 8px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: none;
  }
}

.generate-summary-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.generate-cover-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.category-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.category-header-row {
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

.visibility-radio {
  width: 100%;
  display: flex;
  gap: 16px;

  :deep(.el-radio) {
    flex: 1;
    margin: 0;
    padding: 16px;
    border: 2px solid #e5e6eb;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #165dff;
      background: rgba(22, 93, 255, 0.02);
    }

    &.is-checked {
      border-color: #165dff;
      background: rgba(22, 93, 255, 0.05);
    }

    .el-radio__label {
      width: 100%;
      padding-left: 8px;
    }
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .radio-title {
    font-size: 15px;
    font-weight: 600;
    color: #1d2129;
  }

  .radio-desc {
    font-size: 13px;
    color: #86909c;
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

.attachment-upload {
  margin-bottom: 0;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }
}

.upload-tip {
  font-size: 12px;
  color: #86909c;
  margin-top: 8px;
  line-height: 1.4;
}

.attachments-list {
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid #e5e6eb;
  overflow: hidden;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f5;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f7f8fa;
  }
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.attachment-icon {
  color: #165dff;
  font-size: 18px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-size {
  font-size: 12px;
  color: #86909c;
  white-space: nowrap;
  margin-right: 12px;
}

.remove-attachment-btn {
  padding: 4px 8px;
  border-radius: 4px;
}

.remove-attachment-btn .el-icon {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e6eb;

  .el-button {
    margin: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
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
