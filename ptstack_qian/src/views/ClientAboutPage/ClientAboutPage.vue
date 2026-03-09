<script setup>
// 客户端关于我们页面 - 团队成员展示
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import {
  Document,
  Message,
  OfficeBuilding,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Phone,
  ChatDotRound,
  Connection,
  Location,
  Clock,
} from '@element-plus/icons-vue'
import { getTeamMembers, getContactItems } from '@/api/about'
import { getFullUrl } from '@/utils/url'

const router = useRouter()

// 图标映射
const iconMap = {
  Message,
  Link: LinkIcon,
  OfficeBuilding,
  Phone,
  ChatDotRound,
  Connection,
  Location,
  Clock,
}

// 数据状态
const teamMembers = ref([])
const contactItems = ref([
  {
    id: 1,
    icon: 'Message',
    name: '电子邮件',
    info: 'contact@ptstack.com',
    link: 'mailto:contact@ptstack.com',
  },
  {
    id: 2,
    icon: 'Link',
    name: '开源社区',
    info: 'github.com/ptstack',
    link: 'https://github.com/ptstack',
  },
  {
    id: 3,
    icon: 'OfficeBuilding',
    name: '官方网站',
    info: 'www.ptstack.com',
    link: 'https://www.ptstack.com',
  },
])
const loading = ref(false)

// 控制作品集展开/收起
const expandedMember = ref(null)

// 获取团队成员数据
const fetchTeamMembers = async () => {
  loading.value = true
  try {
    const response = await getTeamMembers()
    teamMembers.value = response.members || []
  } catch (error) {
    console.error('获取团队成员失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取联系信息数据
const fetchContactItems = async () => {
  try {
    const response = await getContactItems()
    if (response.items && response.items.length > 0) {
      contactItems.value = response.items.filter((item) => !item.is_hidden)
    }
  } catch (error) {
    console.error('获取联系信息失败:', error)
  }
}

const togglePortfolio = (memberId) => {
  if (expandedMember.value === memberId) {
    expandedMember.value = null
  } else {
    expandedMember.value = memberId
  }
}

const goToWebsite = (url) => {
  if (url && url !== '#') {
    if (url.startsWith('/')) {
      router.push(url)
    } else {
      window.open(url, '_blank')
    }
  }
}

const goToGithub = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTeamMembers()
  fetchContactItems()
})
</script>

<template>
  <div class="about-page">
    <!-- 团队成员展示 -->
    <section class="team-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">团队成员</h2>
          <p class="section-subtitle">专业的团队，为您提供优质的服务</p>
        </div>

        <div v-loading="loading" class="team-list">
          <div v-if="!loading && teamMembers.length === 0" class="empty-state">
            <el-empty description="暂无团队成员信息" />
          </div>
          <div v-else v-for="member in teamMembers" :key="member.id" class="team-row">
            <!-- 成员信息 -->
            <div class="member-info">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="getFullUrl(member.avatar)" :alt="member.name" />
                <div v-else class="avatar-placeholder">
                  {{ member.name.charAt(0) }}
                </div>
              </div>
              <div class="member-details">
                <h3 class="member-name">{{ member.name }}</h3>
                <div class="member-role">{{ member.role }}</div>
                <p class="member-bio">{{ member.bio }}</p>
                <div class="member-skills">
                  <span v-for="skill in member.skills" :key="skill" class="skill-tag">
                    {{ skill }}
                  </span>
                </div>
                <div class="member-actions">
                  <el-button
                    v-if="member.portfolio && member.portfolio.length > 0"
                    type="primary"
                    size="small"
                    @click="togglePortfolio(member.id)"
                  >
                    {{ expandedMember === member.id ? '收起作品集' : '查看作品集' }}
                    <template #icon>
                      <el-icon v-if="expandedMember === member.id"><ArrowUp /></el-icon>
                      <el-icon v-else><ArrowDown /></el-icon>
                    </template>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 作品集展示 -->
            <div
              v-if="expandedMember === member.id && member.portfolio && member.portfolio.length > 0"
              class="portfolio-section"
            >
              <div class="portfolio-list">
                <div v-for="item in member.portfolio" :key="item.id" class="portfolio-item">
                  <div class="portfolio-image">
                    <img v-if="item.image" :src="getFullUrl(item.image)" :alt="item.title" />
                    <div v-else class="portfolio-placeholder">
                      <el-icon :size="32"><Document /></el-icon>
                    </div>
                  </div>
                  <div class="portfolio-content">
                    <h5 class="portfolio-title">{{ item.title }}</h5>
                    <p class="portfolio-desc">{{ item.description }}</p>
                    <div class="portfolio-actions">
                      <el-button
                        type="primary"
                        size="small"
                        @click="goToWebsite(item.website)"
                        :disabled="!item.website || item.website === '#'"
                      >
                        <el-icon><LinkIcon /></el-icon>
                        访问网站
                      </el-button>
                      <el-button size="small" @click="goToGithub(item.github)">
                        <el-icon><LinkIcon /></el-icon>
                        GitHub
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们 -->
    <section class="contact-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">联系我们</h2>
          <p class="section-subtitle">有任何问题或建议，欢迎随时与我们联系</p>
        </div>

        <div v-if="contactItems.length > 0" class="contact-grid">
          <div
            v-for="item in contactItems"
            :key="item.id"
            class="contact-card"
            @click="item.link && goToWebsite(item.link)"
            :style="{ cursor: item.link ? 'pointer' : 'default' }"
          >
            <div class="contact-icon">
              <el-icon :size="24">
                <component :is="iconMap[item.icon] || Message" />
              </el-icon>
            </div>
            <h3 class="contact-title">{{ item.name }}</h3>
            <p class="contact-info">{{ item.info }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          <el-empty description="暂无联系信息" />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 通用区域样式 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 团队成员展示 */
.team-section {
  padding: 100px 0;
  background: #fff;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.team-row {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 16px;
  padding: 40px;
  transition: all 0.3s ease;

  &:hover {
    background: #fff;
    border-color: #165dff;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
}

.member-info {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.member-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid rgba(22, 93, 255, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  font-weight: 600;
}

.member-details {
  flex: 1;
}

.member-name {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.member-role {
  font-size: 16px;
  color: #165dff;
  font-weight: 500;
  margin-bottom: 16px;
}

.member-bio {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 20px;
}

.member-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.skill-tag {
  padding: 6px 14px;
  background: rgba(22, 93, 255, 0.1);
  border: 1px solid rgba(22, 93, 255, 0.2);
  color: #165dff;
  font-size: 13px;
  border-radius: 20px;
  font-weight: 500;
}

.member-actions {
  display: flex;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
}

/* 作品集样式 */
.portfolio-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #e5e6eb;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.portfolio-list {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.portfolio-item {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    background: #fff;
    border-color: #165dff;
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.portfolio-image {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f0f2f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.portfolio-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.portfolio-content {
  flex: 1;
}

.portfolio-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.portfolio-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 16px;
}

.portfolio-actions {
  display: flex;
  gap: 8px;
}

/* 联系我们 */
.contact-section {
  padding: 100px 0;
  background: #f5f7fa;
  border-top: 1px solid #e5e6eb;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.contact-card {
  text-align: center;
  padding: 40px 32px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .contact-icon {
      background: #165dff;
      color: #fff;
    }
  }
}

.contact-icon {
  width: 56px;
  height: 56px;
  background: rgba(22, 93, 255, 0.1);
  border: 1px solid rgba(22, 93, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #165dff;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.contact-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.contact-info {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 响应式适配 */
@media (max-width: 992px) {
  .member-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .member-avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-placeholder {
    font-size: 40px;
  }

  .member-name {
    font-size: 24px;
  }

  .member-skills {
    justify-content: center;
  }

  .member-actions {
    justify-content: center;
  }

  .portfolio-list {
    justify-content: center;
  }

  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-container {
    padding: 0 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .team-section,
  .contact-section {
    padding: 60px 0;
  }

  .team-row {
    padding: 24px;
  }

  .member-avatar {
    width: 80px;
    height: 80px;
  }

  .avatar-placeholder {
    font-size: 32px;
  }

  .member-name {
    font-size: 20px;
  }

  .portfolio-item {
    min-width: 100%;
    max-width: 100%;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    padding: 32px 24px;
  }
}
</style>
