<script setup>
// 导入Vue的ref和onMounted函数
import { ref, onMounted } from 'vue'
// 导入Vue Router的useRouter和useRoute函数
import { useRouter, useRoute } from 'vue-router'
// 导入获取文章详情的API函数
import { getArticleById } from '@/api/articles'
// 导入Element Plus的ElMessage组件
import { ElMessage } from 'element-plus'
// 导入Element Plus图标组件
import {
  ArrowLeft,
  Warning,
  Document,
  CircleCheck
} from '@element-plus/icons-vue'

// 创建路由实例，用于页面跳转
const router = useRouter()
// 创建路由对象实例，用于获取路由参数
const route = useRoute()

// 加载状态标识
const loading = ref(false)
// 被举报的文章数据
const article = ref(null)
// 选中的举报类型
const reportType = ref('')
// 举报原因内容
const reportContent = ref('')
// 提交状态标识
const submitting = ref(false)
// 举报是否成功的标识
const reportSuccess = ref(false)

// 举报类型选项配置
const reportTypes = [
  { value: 'spam', label: '垃圾内容' }, // 垃圾内容
  { value: 'plagiarism', label: '抄袭/侵权' }, // 抄袭/侵权
  { value: 'inappropriate', label: '不当内容' }, // 不当内容
  { value: 'fake', label: '虚假信息' }, // 虚假信息
  { value: 'other', label: '其他' } // 其他
]

// 返回上一页的函数
const goBack = () => {
  // 使用路由实例返回上一页
  router.back()
}

// 获取被举报文章详情的异步函数
const fetchArticle = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 从路由参数中获取文章ID
    const articleId = route.params.id
    // 调用API获取文章详情
    const res = await getArticleById(articleId)
    // 保存文章数据
    article.value = res
  } catch (error) {
    // 在控制台输出错误信息
    console.error('获取文章失败:', error)
    // 显示错误提示
    ElMessage.error('获取文章失败')
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 提交举报的异步函数
const handleSubmit = async () => {
  // 如果没有选择举报类型，显示提示并返回
  if (!reportType.value) {
    ElMessage.warning('请选择举报类型')
    return
  }
  // 如果举报原因内容为空，显示提示并返回
  if (!reportContent.value.trim()) {
    ElMessage.warning('请填写举报原因')
    return
  }

  try {
    // 设置提交状态为true
    submitting.value = true
    // 模拟API请求延迟1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 设置举报成功状态为true
    reportSuccess.value = true
    // 显示成功提示
    ElMessage.success('举报提交成功')
  } catch (error) {
    // 在控制台输出错误信息
    console.error('提交举报失败:', error)
    // 显示错误提示
    ElMessage.error('提交举报失败')
  } finally {
    // 无论成功或失败，都设置提交状态为false
    submitting.value = false
  }
}

// 组件挂载时的生命周期钩子
onMounted(() => {
  // 获取被举报的文章详情
  fetchArticle()
})
</script>

<template>
  <div class="report-page">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-content">
          <el-skeleton-item variant="text" style="width: 200px; height: 36px; margin-bottom: 32px;" />
          <el-skeleton-item variant="text" style="width: 100%; height: 120px; margin-bottom: 24px;" />
          <el-skeleton-item variant="text" style="width: 100%; height: 200px;" />
        </div>
      </template>
      <template #default>
        <div v-if="!reportSuccess" class="report-content">
          <div class="header-section">
            <el-button @click="goBack" class="back-btn" circle>
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <h1 class="page-title">举报文章</h1>
          </div>

          <div class="content-card">
            <div v-if="article" class="article-preview">
              <div class="preview-header">
                <el-icon class="preview-icon"><Document /></el-icon>
                <span class="preview-label">被举报文章</span>
              </div>
              <div class="article-info">
                <h3 class="article-title">{{ article.title }}</h3>
                <div class="article-meta">
                  <span class="meta-item">作者：{{ article.author_nickname || article.author_name }}</span>
                  <span class="meta-item">发布于：{{ new Date(article.created_at).toLocaleDateString('zh-CN') }}</span>
                </div>
                <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
              </div>
            </div>

            <div class="report-form">
              <div class="form-section">
                <div class="section-title">
                  <el-icon><Warning /></el-icon>
                  <span>举报类型</span>
                </div>
                <div class="type-options">
                  <div
                    v-for="type in reportTypes"
                    :key="type.value"
                    class="type-option"
                    :class="{ active: reportType === type.value }"
                    @click="reportType = type.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ type.label }}</span>
                    </div>
                    <div class="option-check">
                      <el-icon v-if="reportType === type.value"><CircleCheck /></el-icon>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <div class="section-title">
                  <el-icon><Document /></el-icon>
                  <span>举报原因</span>
                </div>
                <el-input
                  v-model="reportContent"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述您的举报原因，以便我们更好地处理..."
                  class="content-textarea"
                />
                <div class="form-tip">
                  <el-icon><Warning /></el-icon>
                  <span>请提供真实有效的举报信息，恶意举报将承担相应责任</span>
                </div>
              </div>

              <div class="form-actions">
                <el-button size="large" @click="goBack" class="cancel-btn">
                  取消
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  :loading="submitting"
                  @click="handleSubmit"
                  class="submit-btn"
                >
                  提交举报
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="success-content">
          <div class="success-card">
            <div class="success-icon-wrapper">
              <el-icon class="success-icon"><CircleCheck /></el-icon>
            </div>
            <h2 class="success-title">举报提交成功</h2>
            <p class="success-desc">我们已收到您的举报，将在1-3个工作日内进行处理</p>
            <div class="success-actions">
              <el-button size="large" @click="goBack" class="back-home-btn">
                返回
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped lang="scss">
.report-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24px;
}

.skeleton-content {
  max-width: 800px;
  margin: 0 auto;
}

.report-content,
.success-content {
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #e5e6eb;
  color: #4e5969;

  &:hover {
    border-color: #165dff;
    color: #165dff;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.content-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-preview {
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
  margin-bottom: 32px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .preview-icon {
    color: #86909c;
    font-size: 16px;
  }

  .preview-label {
    font-size: 14px;
    font-weight: 500;
    color: #4e5969;
  }
}

.article-info {
  .article-title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 12px 0;
  }

  .article-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .meta-item {
      font-size: 13px;
      color: #86909c;
    }
  }

  .article-summary {
    font-size: 14px;
    color: #4e5969;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.report-form {
  .form-section {
    margin-bottom: 32px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 16px;

    .el-icon {
      color: #165dff;
    }
  }

  .type-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .type-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border: 2px solid #e5e6eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #4080ff;
      background: rgba(22, 93, 255, 0.03);
    }

    &.active {
      border-color: #165dff;
      background: rgba(22, 93, 255, 0.05);

      .option-check {
        .el-icon {
          color: #165dff;
          font-size: 20px;
        }
      }
    }
  }

  .option-label {
    font-size: 14px;
    font-weight: 500;
    color: #1d2129;
  }

  .content-textarea {
    :deep(.el-textarea__inner) {
      border-radius: 10px;
      resize: none;
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .form-tip {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 12px;
    padding: 12px 16px;
    background: #fff7e6;
    border-radius: 8px;

    .el-icon {
      color: #ff7d00;
      flex-shrink: 0;
      margin-top: 2px;
    }

    span {
      font-size: 13px;
      color: #ff7d00;
      line-height: 1.6;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #e5e6eb;
  }

  .cancel-btn {
    min-width: 120px;
    border-color: #e5e6eb;
    color: #4e5969;

    &:hover {
      border-color: #165dff;
      color: #165dff;
    }
  }

  .submit-btn {
    min-width: 120px;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

    &:hover {
      box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
    }
  }
}

.success-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.success-icon-wrapper {
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 180, 42, 0.25);
}

.success-icon {
  font-size: 48px;
  color: #ffffff;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 12px 0;
}

.success-desc {
  font-size: 14px;
  color: #86909c;
  margin: 0 0 32px 0;
}

.success-actions {
  .back-home-btn {
    min-width: 140px;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

    &:hover {
      box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
    }
  }
}

@media (max-width: 768px) {
  .report-page {
    padding: 16px;
  }

  .content-card {
    padding: 20px;
  }

  .report-form {
    .type-options {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;

      .cancel-btn,
      .submit-btn {
        width: 100%;
      }
    }
  }
}
</style>
