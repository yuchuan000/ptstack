<script setup>
// 客户端配置页面
// 功能：配置客户端关于我们页面的信息，包括团队成员和联系我们
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Phone,
  Plus,
  Edit,
  Delete,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Message,
  OfficeBuilding,
  ChatDotRound,
  Connection,
  Location,
  Clock,
  View,
  Hide,
  Position,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader/PageHeader.vue'
import ImageUploader from '@/components/Common/ImageUploader.vue'
import SkillTags from '@/components/Common/SkillTags.vue'
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getContactItems,
  createContactItem,
  updateContactItem,
  deleteContactItem,
  updateContactOrder,
  toggleContactVisibility,
  getFooterItems,
  createFooterItem,
  updateFooterItem,
  deleteFooterItem,
  uploadTeamMemberAvatar,
  uploadPortfolioImage,
} from '@/api/about'
import { getFullUrl } from '@/utils/url'

// 当前激活的标签页
const activeTab = ref('team')

// 团队成员相关数据
const teamMembers = ref([])
const teamLoading = ref(false)
const teamDialogVisible = ref(false)
const isEditingTeam = ref(false)
const currentTeamMember = ref(null)

// 团队成员表单
const teamForm = ref({
  name: '',
  role: '',
  avatar: '',
  bio: '',
  skills: [],
})

// 作品集相关
const portfolioList = ref([])
const portfolioDialogVisible = ref(false)
const isEditingPortfolio = ref(false)
const currentPortfolioIndex = ref(-1)

// 作品集表单
const portfolioForm = ref({
  title: '',
  description: '',
  image: '',
  website: '',
  github: '',
})

// 联系信息相关数据
const contactItems = ref([])
const contactLoading = ref(false)
const contactDialogVisible = ref(false)
const isEditingContact = ref(false)
const currentContactItem = ref(null)
const contactForm = ref({
  icon: 'Message',
  name: '',
  info: '',
  link: '',
})

// 底部信息相关数据
const footerItems = ref([])
const footerLoading = ref(false)
const footerDialogVisible = ref(false)
const isEditingFooter = ref(false)
const currentFooterItem = ref(null)
const footerForm = ref({
  display: '',
  link: '',
  pcRowId: 1,
  mobileRowId: 1,
  showOnPc: true,
  showOnMobile: true,
})

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

// 可用图标选项
const iconOptions = [
  { label: '邮件', value: 'Message' },
  { label: '链接', value: 'Link' },
  { label: '办公楼', value: 'OfficeBuilding' },
  { label: '电话', value: 'Phone' },
  { label: '微信', value: 'ChatDotRound' },
  { label: 'GitHub', value: 'Connection' },
  { label: '位置', value: 'Location' },
  { label: '时钟', value: 'Clock' },
]

// 获取团队成员列表
const fetchTeamMembers = async () => {
  try {
    teamLoading.value = true
    const res = await getTeamMembers()
    teamMembers.value = res.members || []
  } catch (error) {
    console.error('获取团队成员失败:', error)
    ElMessage.error('获取团队成员失败')
  } finally {
    teamLoading.value = false
  }
}

// 获取联系我们列表
const fetchContactItems = async () => {
  try {
    contactLoading.value = true
    const res = await getContactItems()
    contactItems.value = res.items || []
  } catch (error) {
    console.error('获取联系信息失败:', error)
    ElMessage.error('获取联系信息失败')
  } finally {
    contactLoading.value = false
  }
}

// 处理标签页切换
const handleTabChange = (tab) => {
  activeTab.value = tab
  if (tab === 'team') {
    fetchTeamMembers()
  } else {
    fetchContactItems()
  }
}

// 打开新增团队成员对话框
const openAddTeamDialog = () => {
  isEditingTeam.value = false
  currentTeamMember.value = null
  teamForm.value = {
    name: '',
    role: '',
    avatar: '',
    bio: '',
    skills: [],
  }
  portfolioList.value = []
  teamDialogVisible.value = true
}

// 打开编辑团队成员对话框
const openEditTeamDialog = (member) => {
  isEditingTeam.value = true
  currentTeamMember.value = member
  teamForm.value = {
    name: member.name,
    role: member.role,
    avatar: member.avatar || '',
    bio: member.bio || '',
    skills: [...(member.skills || [])],
  }
  portfolioList.value = [...(member.portfolio || [])]
  teamDialogVisible.value = true
}

// 保存团队成员
const saveTeamMember = async () => {
  if (!teamForm.value.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }
  if (!teamForm.value.role.trim()) {
    ElMessage.warning('请输入职位')
    return
  }

  try {
    const data = {
      ...teamForm.value,
      portfolio: portfolioList.value,
    }

    if (isEditingTeam.value && currentTeamMember.value) {
      await updateTeamMember(currentTeamMember.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await createTeamMember(data)
      ElMessage.success('创建成功')
    }
    teamDialogVisible.value = false
    fetchTeamMembers()
  } catch (error) {
    console.error('保存团队成员失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除团队成员
const handleDeleteTeamMember = async (member) => {
  try {
    await ElMessageBox.confirm('确定要删除该团队成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTeamMember(member.id)
    ElMessage.success('删除成功')
    fetchTeamMembers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除团队成员失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 打开新增作品集对话框
const openAddPortfolioDialog = () => {
  isEditingPortfolio.value = false
  currentPortfolioIndex.value = -1
  portfolioForm.value = {
    title: '',
    description: '',
    image: '',
    website: '',
    github: '',
  }
  portfolioDialogVisible.value = true
}

// 打开编辑作品集对话框
const openEditPortfolioDialog = (portfolio, index) => {
  isEditingPortfolio.value = true
  currentPortfolioIndex.value = index
  portfolioForm.value = { ...portfolio }
  portfolioDialogVisible.value = true
}

// 保存作品集
const savePortfolio = () => {
  if (!portfolioForm.value.title.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  if (isEditingPortfolio.value && currentPortfolioIndex.value >= 0) {
    portfolioList.value[currentPortfolioIndex.value] = { ...portfolioForm.value }
  } else {
    portfolioList.value.push({ ...portfolioForm.value })
  }
  portfolioDialogVisible.value = false
}

// 删除作品集
const handleDeletePortfolio = (index) => {
  portfolioList.value.splice(index, 1)
}

// 上移作品集
const movePortfolioUp = (index) => {
  if (index === 0) return
  const temp = portfolioList.value[index]
  portfolioList.value[index] = portfolioList.value[index - 1]
  portfolioList.value[index - 1] = temp
}

// 下移作品集
const movePortfolioDown = (index) => {
  if (index === portfolioList.value.length - 1) return
  const temp = portfolioList.value[index]
  portfolioList.value[index] = portfolioList.value[index + 1]
  portfolioList.value[index + 1] = temp
}

// 打开新增联系信息对话框
const openAddContactDialog = () => {
  isEditingContact.value = false
  currentContactItem.value = null
  contactForm.value = {
    icon: '',
    name: '',
    info: '',
    link: '',
  }
  contactDialogVisible.value = true
}

// 打开编辑联系信息对话框
const openEditContactDialog = (item) => {
  isEditingContact.value = true
  currentContactItem.value = item
  contactForm.value = {
    icon: item.icon,
    name: item.name,
    info: item.info,
    link: item.link || '',
  }
  contactDialogVisible.value = true
}

// 保存联系信息
const saveContactItem = async () => {
  if (!contactForm.value.icon) {
    ElMessage.warning('请选择图标')
    return
  }
  if (!contactForm.value.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  if (!contactForm.value.info.trim()) {
    ElMessage.warning('请输入信息')
    return
  }

  try {
    const data = { ...contactForm.value }

    if (isEditingContact.value && currentContactItem.value) {
      await updateContactItem(currentContactItem.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await createContactItem(data)
      ElMessage.success('创建成功')
    }
    contactDialogVisible.value = false
    fetchContactItems()
  } catch (error) {
    console.error('保存联系信息失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除联系信息
const handleDeleteContactItem = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除该联系信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteContactItem(item.id)
    ElMessage.success('删除成功')
    fetchContactItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除联系信息失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 上移联系信息
const moveContactUp = async (index) => {
  if (index === 0) return
  const items = [...contactItems.value]
  const temp = items[index]
  items[index] = items[index - 1]
  items[index - 1] = temp
  // 更新排序
  try {
    await updateContactOrder(items.map((item) => item.id))
    fetchContactItems()
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
  }
}

// 下移联系信息
const moveContactDown = async (index) => {
  if (index === contactItems.value.length - 1) return
  const items = [...contactItems.value]
  const temp = items[index]
  items[index] = items[index + 1]
  items[index + 1] = temp
  // 更新排序
  try {
    await updateContactOrder(items.map((item) => item.id))
    fetchContactItems()
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
  }
}

// 切换联系信息显示/隐藏状态
const toggleContactHidden = async (item) => {
  try {
    const newHiddenStatus = !item.is_hidden
    await toggleContactVisibility(item.id, newHiddenStatus)
    item.is_hidden = newHiddenStatus
    ElMessage.success(newHiddenStatus ? '已隐藏' : '已显示')
  } catch (error) {
    console.error('切换显示状态失败:', error)
    ElMessage.error('切换显示状态失败')
  }
}

// 获取底部信息数据
const fetchFooterItems = async () => {
  footerLoading.value = true
  try {
    const res = await getFooterItems()
    footerItems.value = res.items || []
  } catch (error) {
    console.error('获取底部信息失败:', error)
    ElMessage.error('获取底部信息失败')
  } finally {
    footerLoading.value = false
  }
}

// 打开添加底部信息对话框
const openAddFooterDialog = () => {
  isEditingFooter.value = false
  currentFooterItem.value = null
  footerForm.value = {
    display: '',
    link: '',
    pcRowId: 1,
    mobileRowId: 1,
    showOnPc: true,
    showOnMobile: true,
  }
  footerDialogVisible.value = true
}

// 打开编辑底部信息对话框
const openEditFooterDialog = (item) => {
  isEditingFooter.value = true
  currentFooterItem.value = item
  footerForm.value = {
    display: item.display,
    link: item.link || '',
    pcRowId: item.pcRowId || 1,
    mobileRowId: item.mobileRowId || 1,
    showOnPc: item.showOnPc !== false,
    showOnMobile: item.showOnMobile !== false,
  }
  footerDialogVisible.value = true
}

// 保存底部信息
const saveFooterItem = async () => {
  if (!footerForm.value.display) {
    ElMessage.error('显示内容不能为空')
    return
  }

  try {
    if (isEditingFooter.value) {
      await updateFooterItem(currentFooterItem.value.id, footerForm.value)
      ElMessage.success('更新成功')
    } else {
      await createFooterItem(footerForm.value)
      ElMessage.success('创建成功')
    }
    footerDialogVisible.value = false
    fetchFooterItems()
  } catch (error) {
    console.error('保存底部信息失败:', error)
    ElMessage.error('保存失败')
  }
}

// 处理删除底部信息
const handleDeleteFooterItem = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这条底部信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteFooterItem(item.id)
    ElMessage.success('删除成功')
    fetchFooterItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除底部信息失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTeamMembers()
  fetchContactItems()
  fetchFooterItems()
})
</script>

<template>
  <div class="about-config-page">
    <PageHeader title="客户端配置" subtitle="配置客户端页面信息" />

    <div class="content-card">
      <!-- 标签页切换 -->
      <div class="tabs-section">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'team' }"
          @click="handleTabChange('team')"
        >
          <el-icon><User /></el-icon>
          团队成员
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'contact' }"
          @click="handleTabChange('contact')"
        >
          <el-icon><Phone /></el-icon>
          联系我们
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'footer' }"
          @click="handleTabChange('footer')"
        >
          <el-icon><Position /></el-icon>
          底部信息
        </div>
      </div>

      <!-- 团队成员标签页 -->
      <div v-if="activeTab === 'team'" class="tab-content" v-loading="teamLoading">
        <div class="section-header">
          <h3 class="section-title">团队成员列表</h3>
          <el-button type="primary" @click="openAddTeamDialog">
            <el-icon><Plus /></el-icon>
            新建档案
          </el-button>
        </div>

        <div class="team-list">
          <div v-for="member in teamMembers" :key="member.id" class="team-card">
            <div class="team-card-header">
              <div class="member-avatar">
                <img v-if="member.avatar" :src="getFullUrl(member.avatar)" :alt="member.name" />
                <div v-else class="avatar-placeholder">
                  {{ member.name.charAt(0) }}
                </div>
              </div>
              <div class="member-info">
                <h4 class="member-name">{{ member.name }}</h4>
                <span class="member-role">{{ member.role }}</span>
              </div>
            </div>
            <p class="member-bio">{{ member.bio }}</p>
            <div class="member-skills">
              <el-tag v-for="skill in member.skills" :key="skill" size="small" type="info">
                {{ skill }}
              </el-tag>
            </div>
            <div class="member-portfolio-count">作品集: {{ member.portfolio?.length || 0 }} 个</div>
            <div class="card-actions">
              <el-button type="primary" link @click="openEditTeamDialog(member)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDeleteTeamMember(member)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>

          <el-empty v-if="teamMembers.length === 0" description="暂无团队成员" />
        </div>
      </div>

      <!-- 联系我们标签页 -->
      <div v-if="activeTab === 'contact'" class="tab-content" v-loading="contactLoading">
        <div class="section-header">
          <h3 class="section-title">联系信息列表</h3>
          <el-button type="primary" @click="openAddContactDialog">
            <el-icon><Plus /></el-icon>
            新增联系信息
          </el-button>
        </div>

        <div class="contact-list">
          <div
            v-for="(item, index) in contactItems"
            :key="item.id"
            class="contact-card"
            :class="{ 'is-hidden': item.is_hidden }"
          >
            <div class="contact-icon-wrapper">
              <el-icon :size="24">
                <component :is="iconMap[item.icon] || Message" />
              </el-icon>
            </div>
            <div class="contact-info">
              <h4 class="contact-name">{{ item.name }}</h4>
              <p class="contact-text">{{ item.info }}</p>
              <p v-if="item.link" class="contact-link">{{ item.link }}</p>
              <el-tag v-if="item.is_hidden" size="small" type="info" class="hidden-tag"
                >已隐藏</el-tag
              >
            </div>
            <div class="contact-actions">
              <el-button link @click="moveContactUp(index)" :disabled="index === 0">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                link
                @click="moveContactDown(index)"
                :disabled="index === contactItems.length - 1"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button
                :type="item.is_hidden ? 'success' : 'warning'"
                link
                @click="toggleContactHidden(item)"
              >
                <el-icon><View v-if="item.is_hidden" /><Hide v-else /></el-icon>
              </el-button>
              <el-button type="primary" link @click="openEditContactDialog(item)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link @click="handleDeleteContactItem(item)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-empty v-if="contactItems.length === 0" description="暂无联系信息" />
        </div>
      </div>

      <!-- 底部信息标签页 -->
      <div v-if="activeTab === 'footer'" class="tab-content" v-loading="footerLoading">
        <div class="section-header">
          <h3 class="section-title">底部信息列表</h3>
          <el-button type="primary" @click="openAddFooterDialog">
            <el-icon><Plus /></el-icon>
            新增底部信息
          </el-button>
        </div>

        <div class="footer-list">
          <div v-for="item in footerItems" :key="item.id" class="footer-card">
            <div class="footer-info">
              <h4 class="footer-display">{{ item.display }}</h4>
              <p v-if="item.link" class="footer-link">{{ item.link }}</p>
              <div class="footer-settings">
                <el-tag size="small" class="row-id-tag">PC行ID: {{ item.pcRowId }}</el-tag>
                <el-tag size="small" class="row-id-tag">移动行ID: {{ item.mobileRowId }}</el-tag>
                <el-tag v-if="item.showOnPc" size="small" type="success">PC端显示</el-tag>
                <el-tag v-if="item.showOnMobile" size="small" type="info">移动端显示</el-tag>
              </div>
            </div>
            <div class="footer-actions">
              <el-button type="primary" link @click="openEditFooterDialog(item)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link @click="handleDeleteFooterItem(item)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <el-empty v-if="footerItems.length === 0" description="暂无底部信息" />
        </div>
      </div>
    </div>

    <!-- 团队成员编辑对话框 -->
    <el-dialog
      v-model="teamDialogVisible"
      :title="isEditingTeam ? '编辑团队成员' : '新建团队成员'"
      width="700px"
      destroy-on-close
    >
      <el-form :model="teamForm" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="teamForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="职位" required>
          <el-input v-model="teamForm.role" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="头像">
          <ImageUploader
            v-model="teamForm.avatar"
            :upload-function="uploadTeamMemberAvatar"
            placeholder="点击上传头像"
            :is-circle="true"
          />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="teamForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>
        <el-form-item label="技能">
          <SkillTags v-model="teamForm.skills" />
        </el-form-item>

        <!-- 作品集管理 -->
        <el-form-item label="作品集">
          <div class="portfolio-section">
            <div class="portfolio-header">
              <span>共 {{ portfolioList.length }} 个项目</span>
              <el-button type="primary" size="small" @click="openAddPortfolioDialog">
                <el-icon><Plus /></el-icon>
                添加项目
              </el-button>
            </div>
            <div class="portfolio-list">
              <div v-for="(portfolio, index) in portfolioList" :key="index" class="portfolio-item">
                <div class="portfolio-info">
                  <span class="portfolio-title">{{ portfolio.title }}</span>
                  <span class="portfolio-desc">{{ portfolio.description }}</span>
                </div>
                <div class="portfolio-actions">
                  <el-button link @click="movePortfolioUp(index)" :disabled="index === 0">
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button
                    link
                    @click="movePortfolioDown(index)"
                    :disabled="index === portfolioList.length - 1"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <el-button link @click="openEditPortfolioDialog(portfolio, index)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button type="danger" link @click="handleDeletePortfolio(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="teamDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTeamMember">保存</el-button>
      </template>
    </el-dialog>

    <!-- 作品集编辑对话框 -->
    <el-dialog
      v-model="portfolioDialogVisible"
      :title="isEditingPortfolio ? '编辑项目' : '添加项目'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="portfolioForm" label-width="80px">
        <el-form-item label="项目名称" required>
          <el-input v-model="portfolioForm.title" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="portfolioForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="项目图片">
          <ImageUploader
            v-model="portfolioForm.image"
            :upload-function="uploadPortfolioImage"
            placeholder="点击上传图片"
            preview-width="200px"
            preview-height="120px"
            :is-circle="false"
          />
        </el-form-item>
        <el-form-item label="网站链接">
          <el-input v-model="portfolioForm.website" placeholder="请输入网站链接">
            <template #prefix>
              <el-icon><LinkIcon /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="GitHub">
          <el-input v-model="portfolioForm.github" placeholder="请输入GitHub链接">
            <template #prefix>
              <el-icon><LinkIcon /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="portfolioDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePortfolio">保存</el-button>
      </template>
    </el-dialog>

    <!-- 联系信息编辑对话框 -->
    <el-dialog
      v-model="contactDialogVisible"
      :title="isEditingContact ? '编辑联系信息' : '新增联系信息'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="contactForm" label-width="80px">
        <el-form-item label="图标" required>
          <el-select v-model="contactForm.icon" placeholder="请选择图标" style="width: 100%">
            <el-option
              v-for="option in iconOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <span style="display: flex; align-items: center; gap: 8px">
                <el-icon>
                  <component :is="iconMap[option.value] || Message" />
                </el-icon>
                {{ option.label }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="contactForm.name" placeholder="请输入名称，如：电子邮件" />
        </el-form-item>
        <el-form-item label="信息" required>
          <el-input
            v-model="contactForm.info"
            placeholder="请输入联系信息，如：contact@ptstack.com"
          />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="contactForm.link" placeholder="请输入跳转链接（可选）">
            <template #prefix>
              <el-icon><LinkIcon /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="contactDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContactItem">保存</el-button>
      </template>
    </el-dialog>

    <!-- 底部信息编辑对话框 -->
    <el-dialog
      v-model="footerDialogVisible"
      :title="isEditingFooter ? '编辑底部信息' : '新增底部信息'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="footerForm" label-width="80px">
        <el-form-item label="显示内容" required>
          <el-input v-model="footerForm.display" placeholder="请输入显示内容" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="footerForm.link" placeholder="请输入跳转链接（可选）">
            <template #prefix>
              <el-icon><LinkIcon /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="PC端行数ID" required>
          <el-input
            v-model.number="footerForm.pcRowId"
            type="number"
            placeholder="请输入PC端行数ID"
            min="1"
          />
        </el-form-item>
        <el-form-item label="移动端行数ID" required>
          <el-input
            v-model.number="footerForm.mobileRowId"
            type="number"
            placeholder="请输入移动端行数ID"
            min="1"
          />
        </el-form-item>
        <el-form-item label="显示设置">
          <div class="checkbox-group">
            <el-checkbox v-model="footerForm.showOnPc">PC端显示</el-checkbox>
            <el-checkbox v-model="footerForm.showOnMobile">移动端显示</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="footerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFooterItem">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.about-config-page {
  padding-bottom: 40px;
}

.content-card {
  background: #fff;
  border-radius: 16px;
  margin: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tabs-section {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e6eb;
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

.tab-content {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

// 团队成员样式
.team-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.team-card {
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
  }
}

.team-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

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
  font-size: 24px;
  font-weight: 600;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.member-role {
  font-size: 14px;
  color: #165dff;
  font-weight: 500;
}

.member-bio {
  font-size: 14px;
  color: #4e5969;
  line-height: 1.6;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.member-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.member-portfolio-count {
  font-size: 13px;
  color: #86909c;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e6eb;
}

// 联系信息样式
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
  }

  &.is-hidden {
    opacity: 0.6;
    background: #f0f0f0;
  }
}

.hidden-tag {
  margin-top: 4px;
}

/* 底部信息样式 */
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
  }
}

.footer-info {
  flex: 1;
}

.footer-display {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.footer-link {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px;
  word-break: break-all;
}

.footer-settings {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.row-id-tag {
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
  border-color: rgba(22, 93, 255, 0.2);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.checkbox-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 4px;
}

.contact-text {
  font-size: 14px;
  color: #4e5969;
  margin: 0 0 2px;
}

.contact-link {
  font-size: 13px;
  color: #165dff;
  margin: 0;
}

.contact-actions {
  display: flex;
  gap: 4px;
}

// 表单样式
.skills-input-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.portfolio-section {
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #4e5969;
}

.portfolio-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.portfolio-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
}

.portfolio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.portfolio-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d2129;
}

.portfolio-desc {
  font-size: 13px;
  color: #86909c;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.portfolio-actions {
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .content-card {
    margin: 16px;
  }

  .tabs-section {
    padding: 12px 16px;
  }

  .tab-content {
    padding: 16px;
  }

  .team-list {
    grid-template-columns: 1fr;
  }

  .contact-card {
    flex-wrap: wrap;
  }

  .contact-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #e5e6eb;
  }
}
</style>
