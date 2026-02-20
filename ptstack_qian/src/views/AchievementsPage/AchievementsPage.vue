<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Trophy,
  Star,
  Document,
  ChatDotRound,
  User,
  UserFilled,
  Lock,
  Unlock,
  Check,
  Present,
  Collection
} from '@element-plus/icons-vue'
import { getMyAchievements } from '@/api/achievements'
import { getFullUrl } from '@/utils/url'
const loading = ref(false)
const achievements = ref([])
const typeStats = ref({})
const totalStats = ref({})
const currentType = ref('all')

const achievementTypes = [
  { key: 'all', label: '全部', icon: Trophy },
  { key: 'article', label: '文章', icon: Document },
  { key: 'comment', label: '评论', icon: ChatDotRound },
  { key: 'like', label: '点赞', icon: Star },
  { key: 'follow', label: '关注', icon: User },
  { key: 'follower', label: '粉丝', icon: UserFilled },
  { key: 'event', label: '活动', icon: Present },
  { key: 'limited', label: '限定', icon: Collection }
]

const isImageIcon = (icon) => {
  if (!icon) return false
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.')
}

const getAchievementIcon = (type, icon) => {
  switch (icon) {
    case 'Document':
      return Document
    case 'ChatDotRound':
      return ChatDotRound
    case 'Star':
      return Star
    case 'User':
      return User
    case 'UserFilled':
      return UserFilled
    case 'Trophy':
      return Trophy
    default:
      switch (type) {
        case 'article':
          return Document
        case 'comment':
          return ChatDotRound
        case 'like':
          return Star
        case 'follow':
          return User
        case 'follower':
          return UserFilled
        case 'event':
          return Trophy
        default:
          return Trophy
      }
  }
}

const getTypeLabel = (type) => {
  const typeItem = achievementTypes.find(t => t.key === type)
  return typeItem?.label || type
}

const fetchAchievements = async () => {
  try {
    loading.value = true
    const response = await getMyAchievements()
    achievements.value = response.achievements
    typeStats.value = response.typeStats
    totalStats.value = response.totalStats
  } catch (error) {
    console.error('获取成就失败:', error)
    ElMessage.error('获取成就失败')
  } finally {
    loading.value = false
  }
}

const getFilteredAchievements = () => {
  if (currentType.value === 'event') {
    return achievements.value.filter(a => a.is_event === 1 || a.is_event === true)
  } else if (currentType.value === 'limited') {
    return achievements.value.filter(a => a.is_limited === 1 || a.is_limited === true)
  } else if (currentType.value !== 'all') {
    return achievements.value.filter(a => a.type === currentType.value)
  }
  return achievements.value
}

const getProgressPercent = () => {
  if (totalStats.value.total === 0) return 0
  return Math.round((totalStats.value.unlocked / totalStats.value.total) * 100)
}

onMounted(() => {
  fetchAchievements()
})
</script>

<template>
  <div class="achievements-page">
    <div class="stats-card">
      <div class="stats-header">
        <div class="stats-icon">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stats-info">
          <div class="stats-title">成就进度</div>
          <div class="stats-number">
            {{ totalStats.unlocked }} / {{ totalStats.total }}
          </div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: getProgressPercent() + '%' }"></div>
      </div>
      <div class="progress-text">{{ getProgressPercent() }}%</div>
    </div>

    <div class="type-stats">
      <div
        v-for="stat in Object.entries(typeStats)"
        :key="stat[0]"
        class="type-stat-item"
      >
        <div class="type-stat-label">{{ getTypeLabel(stat[0]) }}</div>
        <div class="type-stat-value">{{ stat[1].unlocked }}/{{ stat[1].total }}</div>
      </div>
    </div>

    <div class="tabs-container">
      <div
        v-for="tab in achievementTypes"
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentType === tab.key }"
        @click="currentType = tab.key"
      >
        <el-icon class="tab-icon"><component :is="tab.icon" /></el-icon>
        <span class="tab-text">{{ tab.label }}</span>
      </div>
    </div>

    <div class="achievements-grid" v-loading="loading">
      <div
        v-for="achievement in getFilteredAchievements()"
        :key="achievement.id"
        class="achievement-card"
        :class="{ unlocked: achievement.unlocked }"
      >
        <div class="achievement-icon-wrapper">
          <div
            class="achievement-icon"
            :class="{ locked: !achievement.unlocked }"
          >
            <template v-if="achievement.unlocked">
              <img v-if="isImageIcon(achievement.icon)" :src="getFullUrl(achievement.icon)" class="achievement-icon-image" />
              <el-icon v-else>
                <component :is="getAchievementIcon(achievement.type, achievement.icon)" />
              </el-icon>
            </template>
            <el-icon v-else>
              <Lock />
            </el-icon>
          </div>
          <div v-if="achievement.unlocked" class="unlock-badge">
            <el-icon><Unlock /></el-icon>
          </div>
        </div>
        <div class="achievement-content">
          <div class="achievement-name">
            {{ achievement.name }}
            <el-tag v-if="achievement.custom_tag" size="small" type="success" style="margin-left: 8px;">{{ achievement.custom_tag }}</el-tag>
            <el-tag v-if="achievement.is_event" size="small" type="warning" style="margin-left: 8px;">活动</el-tag>
            <el-tag v-if="achievement.is_limited" size="small" type="danger" style="margin-left: 8px;">限定</el-tag>
          </div>
          <div class="achievement-description">
            {{ achievement.description }}
          </div>
          <div v-if="achievement.unlocked_at" class="unlock-time">
            <el-icon><Check /></el-icon>
            获得于 {{ new Date(achievement.unlocked_at).toLocaleDateString('zh-CN') }}
          </div>
        </div>
      </div>

      <div v-if="getFilteredAchievements().length === 0 && !loading" class="empty-state">
        <div class="empty-illustration">
          <svg viewBox="0 0 200 160" class="breathing-svg">
            <g fill="none" stroke="#86909c" stroke-width="2">
              <circle cx="100" cy="70" r="35" fill="#f7f8fa"/>
              <path d="M85 65 L95 75 L115 55" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="100" cy="125" r="5" fill="#86909c" opacity="0.3"/>
              <circle cx="100" cy="125" r="8" fill="#86909c" opacity="0.15"/>
            </g>
          </svg>
        </div>
        <div class="empty-text">暂无成就</div>
        <div class="empty-desc">继续探索，解锁更多成就</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.achievements-page {
  min-height: 100%;
}

.stats-card {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stats-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.2);

  .el-icon {
    font-size: 28px;
  }
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 4px;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #1d2129;
}

.progress-bar {
  height: 8px;
  background: #f2f3f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #165dff 0%, #4080ff 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  color: #86909c;
  text-align: right;
}

.type-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.type-stat-item {
  flex-shrink: 0;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.type-stat-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 4px;
}

.type-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border-radius: 10px;
  color: #86909c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    color: #165dff;
    background: #f7f8fa;
  }

  &.active {
    color: white;
    background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.2);
  }
}

.tab-icon {
  font-size: 16px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.achievement-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  opacity: 0.6;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  &.unlocked {
    opacity: 1;
  }
}

.achievement-icon-wrapper {
  position: relative;
}

.achievement-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f7f8fa 0%, #e5e6eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  transition: all 0.3s ease;
  overflow: hidden;

  .el-icon {
    font-size: 32px;
  }

  &.locked {
    filter: grayscale(100%);
  }
}

.achievement-icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.achievement-card.unlocked .achievement-icon {
  background: linear-gradient(135deg, #ffd54f 0%, #ffb300 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 179, 0, 0.3);
}

.unlock-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00b42a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 180, 42, 0.3);

  .el-icon {
    font-size: 14px;
  }
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.achievement-description {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 10px;
  line-height: 1.5;
}

.achievement-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.condition-type {
  font-size: 12px;
  padding: 4px 10px;
  background: #f2f3f5;
  color: #4e5969;
  border-radius: 4px;
}

.condition-value {
  font-size: 12px;
  color: #86909c;
}

.unlock-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #00b42a;

  .el-icon {
    font-size: 12px;
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-illustration {
  margin-bottom: 20px;
}

.breathing-svg {
  width: 160px;
  height: 128px;
  animation: breathing 3s ease-in-out infinite;
}

@keyframes breathing {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 12px;
  color: #86909c;
}
</style>
