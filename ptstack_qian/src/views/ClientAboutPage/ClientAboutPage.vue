<script setup>
// 客户端关于我们页面 - 团队成员展示
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import {
  Document,
  Message,
  Link,
  OfficeBuilding,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon
} from '@element-plus/icons-vue'

const router = useRouter()

const teamMembers = [
  {
    id: 1,
    name: '张三',
    role: '全栈开发工程师',
    avatar: '',
    bio: '专注于前端和后端技术，热爱开源，致力于打造高效、稳定的技术架构',
    skills: ['JavaScript', 'Vue', 'Node.js', 'Python'],
    portfolio: [
      {
        id: 101,
        title: 'PTStack 内容平台',
        description: '全栈开发的内容分享平台，支持文章发布、分类管理、用户系统等功能',
        image: '',
        website: '/articles',
        github: 'https://github.com/zhangsan/ptstack'
      },
      {
        id: 102,
        title: '个人博客系统',
        description: '基于 Vue 和 Express 开发的个人博客系统，支持 Markdown 编辑和主题切换',
        image: '',
        website: '#',
        github: 'https://github.com/zhangsan/blog'
      }
    ]
  },
  {
    id: 2,
    name: '李四',
    role: 'UI/UX 设计师',
    avatar: '',
    bio: '专注于用户体验设计，擅长交互设计和视觉设计，追求美观与实用的完美结合',
    skills: ['Figma', 'Sketch', 'UI Design', 'UX Research'],
    portfolio: [
      {
        id: 201,
        title: 'PTStack 界面设计',
        description: '为 PTStack 平台设计的用户界面，包括首页、文章页、个人中心等',
        image: '',
        website: '/',
        github: 'https://github.com/lisi/ptstack-design'
      },
      {
        id: 202,
        title: '移动应用界面设计',
        description: '为某移动应用设计的界面，注重用户体验和视觉效果',
        image: '',
        website: '#',
        github: 'https://github.com/lisi/mobile-app-design'
      }
    ]
  },
  {
    id: 3,
    name: '王五',
    role: '内容运营专员',
    avatar: '',
    bio: '专注于内容策划和运营，擅长内容创作和社区管理，致力于打造优质的内容生态',
    skills: ['Content Creation', 'Community Management', 'Marketing', 'Writing'],
    portfolio: [
      {
        id: 301,
        title: '技术博客系列',
        description: '策划并发布的技术博客系列，涵盖前端、后端、人工智能等多个领域',
        image: '',
        website: '/articles',
        github: 'https://github.com/wangwu/tech-blog'
      },
      {
        id: 302,
        title: '社区活动策划',
        description: '组织的线上线下技术分享活动，促进技术交流和社区建设',
        image: '',
        website: '#',
        github: 'https://github.com/wangwu/community-events'
      }
    ]
  }
]

// 控制作品集展开/收起
const expandedMember = ref(null)

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

        <div class="team-list">
          <div v-for="member in teamMembers" :key="member.id" class="team-row">
            <!-- 成员信息 -->
            <div class="member-info">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name">
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
            <div v-if="expandedMember === member.id" class="portfolio-section">
              <div class="portfolio-list">
                <div v-for="item in member.portfolio" :key="item.id" class="portfolio-item">
                  <div class="portfolio-image">
                    <img v-if="item.image" :src="item.image" :alt="item.title">
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
                      <el-button
                        size="small"
                        @click="goToGithub(item.github)"
                      >
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

        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">
              <el-icon :size="24"><Message /></el-icon>
            </div>
            <h3 class="contact-title">电子邮件</h3>
            <p class="contact-info">contact@ptstack.com</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <el-icon :size="24"><Link /></el-icon>
            </div>
            <h3 class="contact-title">开源社区</h3>
            <p class="contact-info">github.com/ptstack</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <el-icon :size="24"><OfficeBuilding /></el-icon>
            </div>
            <h3 class="contact-title">官方网站</h3>
            <p class="contact-info">www.ptstack.com</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
}

.team-row:hover {
  background: #fff;
  border-color: #165dff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.portfolio-item:hover {
  background: #fff;
  border-color: #165dff;
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.portfolio-image {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f0f2f5;
}

.portfolio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.contact-card:hover {
  border-color: #165dff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
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

.contact-card:hover .contact-icon {
  background: #165dff;
  color: #fff;
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
