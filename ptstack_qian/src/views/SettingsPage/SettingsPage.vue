<script setup>
// 导入Vue的ref、reactive和onMounted函数
import { ref, reactive, onMounted } from 'vue'
// 导入Vue Router的useRouter函数
import { useRouter } from 'vue-router'
// 导入用户状态管理store
import { useUserStore } from '@/stores/user'
// 导入Element Plus的ElMessage组件
import { ElMessage } from 'element-plus'
// 导入Element Plus图标组件
import {
  User,
  Lock,
  Check
} from '@element-plus/icons-vue'
// 导入更新个人资料和隐私设置的API函数
import { updateProfile, updatePrivacySettings } from '@/api/users'
// 导入页面标题组件
import PageHeader from '@/components/PageHeader/PageHeader.vue'

// 创建路由实例，用于页面跳转
const router = useRouter()
// 创建用户状态管理实例
const userStore = useUserStore()

// 当前激活的选项卡：profile-个人资料，privacy-隐私设置
const activeTab = ref('profile')
// 加载状态标识
const loading = ref(false)

// 个人资料表单数据
const profileForm = reactive({
  bio: '', // 个人简介
  website: '' // 个人网站
})

// 隐私设置表单数据
const privacyForm = reactive({
  show_followers: true, // 是否显示订阅者列表
  show_following: true, // 是否显示订阅列表
  show_articles: true, // 是否显示发布的文章
  show_comments: true // 是否显示发表的评论
})

// 初始化表单数据的函数
const initForm = () => {
  // 设置个人简介，如果没有则用空字符串
  profileForm.bio = userStore.userInfo?.bio || ''
  // 设置个人网站，如果没有则用空字符串
  profileForm.website = userStore.userInfo?.website || ''
  // 设置是否显示订阅者列表，默认值为true
  privacyForm.show_followers = userStore.userInfo?.show_followers !== false
  // 设置是否显示订阅列表，默认值为true
  privacyForm.show_following = userStore.userInfo?.show_following !== false
  // 设置是否显示发布的文章，默认值为true
  privacyForm.show_articles = userStore.userInfo?.show_articles !== false
  // 设置是否显示发表的评论，默认值为true
  privacyForm.show_comments = userStore.userInfo?.show_comments !== false
}

// 保存个人资料的异步函数
const handleSaveProfile = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 调用API更新个人资料
    const res = await updateProfile(profileForm)
    // 更新用户状态管理中的用户信息
    userStore.updateUserInfo(res.user)
    // 显示成功提示
    ElMessage.success('保存成功')
  } catch (error) {
    // 在控制台输出错误信息
    console.error('保存失败:', error)
    // 显示错误提示
    ElMessage.error('保存失败')
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 保存隐私设置的异步函数
const handleSavePrivacy = async () => {
  try {
    // 设置加载状态为true
    loading.value = true
    // 调用API更新隐私设置
    const res = await updatePrivacySettings(privacyForm)
    // 更新用户状态管理中的用户信息
    userStore.updateUserInfo(res.user)
    // 显示成功提示
    ElMessage.success('隐私设置已保存')
  } catch (error) {
    // 在控制台输出错误信息
    console.error('保存失败:', error)
    // 显示错误提示
    ElMessage.error('保存失败')
  } finally {
    // 无论成功或失败，都设置加载状态为false
    loading.value = false
  }
}

// 跳转到用户个人主页的函数
const goToProfile = () => {
  // 使用路由实例跳转到当前用户的个人主页
  router.push(`/profile/${userStore.userInfo?.id}`)
}



// 组件挂载时的生命周期钩子
onMounted(() => {
  // 初始化表单数据
  initForm()
})
</script>

<template>
  <div class="settings-page">
    <PageHeader title="设置" subtitle="管理您的个人资料和隐私设置">
      <template #actions>
        <el-button type="primary" @click="goToProfile">
          <el-icon><User /></el-icon>
          查看我的主页
        </el-button>
      </template>
    </PageHeader>

    <div class="content-card">
      <div class="tabs-section">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <el-icon><User /></el-icon>
          <span>个人资料</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'privacy' }"
          @click="activeTab = 'privacy'"
        >
          <el-icon><Lock /></el-icon>
          <span>隐私设置</span>
        </div>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <div class="form-section">
            <div class="section-header">
              <div class="section-title">个人资料</div>
              <div class="section-desc">完善您的个人信息</div>
            </div>

            <div class="form-content">
              <div class="form-item">
                <div class="form-label">个人简介</div>
                <div class="form-input">
                  <el-input
                    v-model="profileForm.bio"
                    type="textarea"
                    :rows="4"
                    placeholder="介绍一下自己吧..."
                    maxlength="500"
                    show-word-limit
                    class="bio-input"
                  />
                </div>
              </div>

              <div class="form-item">
                <div class="form-label">个人网站</div>
                <div class="form-input">
                  <el-input
                    v-model="profileForm.website"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div class="form-footer">
                <el-button
                  type="primary"
                  size="large"
                  @click="handleSaveProfile"
                  :loading="loading"
                  class="save-btn"
                >
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'privacy'" class="tab-panel">
          <div class="privacy-section">
            <div class="section-header">
              <div class="section-title">隐私设置</div>
              <div class="section-desc">控制哪些信息可以被其他用户查看</div>
            </div>

            <div class="privacy-options">
              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示订阅者列表</div>
                  <div class="option-desc">允许其他人查看你的订阅者列表</div>
                </div>
                <el-switch v-model="privacyForm.show_followers" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示订阅列表</div>
                  <div class="option-desc">允许其他人查看你订阅了哪些用户</div>
                </div>
                <el-switch v-model="privacyForm.show_following" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示发布的文章</div>
                  <div class="option-desc">允许其他人在你的主页看到你发布的文章</div>
                </div>
                <el-switch v-model="privacyForm.show_articles" size="large" />
              </div>

              <div class="privacy-option">
                <div class="option-content">
                  <div class="option-title">显示发表的评论</div>
                  <div class="option-desc">允许其他人在你的主页看到你发表的评论</div>
                </div>
                <el-switch v-model="privacyForm.show_comments" size="large" />
              </div>
            </div>

            <div class="form-footer">
              <el-button
                type="primary"
                size="large"
                @click="handleSavePrivacy"
                :loading="loading"
                class="save-btn"
              >
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: white;
  border: 1px solid #e5e6eb;
  color: #4e5969;
  transition: all 0.2s ease;

  &:hover {
    background: #f7f8fa;
    border-color: #165dff;
    color: #165dff;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
  letter-spacing: -0.3px;
}

.profile-btn {
  border-radius: 10px;
  height: 42px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tabs-section {
  display: flex;
  gap: 8px;
  padding: 24px 24px 0;
  border-bottom: 1px solid #f7f8fa;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;

  &:hover {
    background: #f7f8fa;
    color: #1d2129;
  }

  &.active {
    background: #eaf2ff;
    color: #165dff;
  }

  .el-icon {
    font-size: 16px;
  }
}

.tab-content {
  padding: 32px 24px;
}

.tab-panel {
  max-width: 600px;
}

.form-section,
.privacy-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.section-desc {
  font-size: 13px;
  color: #86909c;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.form-input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: 0 0 0 1px #e5e6eb inset;
    transition: all 0.2s ease;
  }

  :deep(.el-textarea__inner) {
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: 0 0 0 1px #e5e6eb inset;
    transition: all 0.2s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-textarea__inner:hover) {
    box-shadow: 0 0 0 1px #c9cdd4 inset;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2) inset !important;
  }
}

.bio-input {
  :deep(.el-textarea__inner) {
    resize: none;
  }
}

.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.privacy-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f7f8fa;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: #f2f3f5;
  }
}

.option-content {
  flex: 1;
  margin-right: 20px;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 4px;
}

.option-desc {
  font-size: 13px;
  color: #86909c;
  line-height: 1.5;
}

.form-footer {
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;
}

.save-btn {
  border-radius: 10px;
  height: 44px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
    box-shadow: 0 6px 16px rgba(22, 93, 255, 0.35);
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-btn {
    width: 100%;
    justify-content: center;
  }

  .tabs-section {
    flex-direction: column;
    gap: 4px;
  }

  .tab-item {
    width: 100%;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
