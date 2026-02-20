<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAnnouncementById, markAnnouncementRead } from '@/api/announcements'
import { ArrowLeft, Bell, Calendar, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { MdPreview } from 'md-editor-v3'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const announcement = ref(null)

const fetchAnnouncement = async () => {
  try {
    loading.value = true
    const res = await getAnnouncementById(route.params.id)
    announcement.value = res.announcement

    if (!announcement.value.is_read) {
      try {
        await markAnnouncementRead(announcement.value.id)
        announcement.value.is_read = true
      } catch (error) {
        console.error('标记公告已读失败:', error)
      }
    }
  } catch (error) {
    console.error('获取公告失败:', error)
    ElMessage.error('获取公告失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchAnnouncement()
})
</script>

<template>
  <div class="announcement-detail-page" v-loading="loading">
    <div class="detail-header" v-if="announcement">
      <div class="header-inner">
        <el-button @click="goBack" circle class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="announcement-container" v-if="announcement">
      <div class="announcement-main">
        <div class="announcement-content">
          <div class="announcement-icon-wrapper">
            <el-icon><Bell /></el-icon>
          </div>

          <h1 class="announcement-title">{{ announcement.title }}</h1>

          <div class="announcement-meta">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(announcement.created_at) }}
            </span>
          </div>

          <div class="announcement-body">
            <div class="announcement-text">
              <MdPreview :modelValue="announcement.content" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.announcement-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
  padding-bottom: 60px;
}

.detail-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e6eb;
  padding: 24px 0;
  margin-bottom: 32px;

  .header-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .back-btn {
    border: 1px solid #e5e6eb;
  }
}

.announcement-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.announcement-main {
  min-width: 0;
}

.announcement-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.announcement-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);

  .el-icon {
    font-size: 28px;
  }
}

.announcement-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.announcement-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e5e6eb;
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4e5969;
    font-size: 15px;

    .el-icon {
      color: #86909c;
    }
  }
}

.announcement-body {
  .announcement-text {
    font-size: 16px;
    color: #1d2129;
    line-height: 1.9;
  }
}

@media (max-width: 768px) {
  .detail-header {
    padding: 16px 0;
  }

  .announcement-content {
    padding: 24px;
  }

  .announcement-title {
    font-size: 24px;
  }

  .announcement-icon-wrapper {
    width: 48px;
    height: 48px;

    .el-icon {
      font-size: 24px;
    }
  }
}
</style>
