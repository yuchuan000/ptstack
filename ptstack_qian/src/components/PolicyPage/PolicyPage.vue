<script setup>
// 政策条款页面组件 - 用于展示用户协议、隐私政策等内容
import { useRouter } from 'vue-router' // 导入路由钩子
import { ArrowLeft } from '@element-plus/icons-vue' // 导入左箭头图标

// 定义组件接收的属性
defineProps({
  // 政策标题，必填
  title: {
    type: String, // 属性类型为字符串
    required: true // 必填属性
  },
  // 更新日期，必填
  updateDate: {
    type: String, // 属性类型为字符串
    required: true // 必填属性
  },
  // 生效日期，必填
  effectiveDate: {
    type: String, // 属性类型为字符串
    required: true // 必填属性
  }
})

// 获取路由实例
const router = useRouter()

// 返回上一页的函数
const goBack = () => {
  router.back() // 调用路由的back方法返回上一页
}
</script>

<template>
  <div class="policy-page">
    <div class="policy-container">
      <div class="policy-header">
        <el-button @click="goBack" circle>
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="policy-title">{{ title }}</h1>
      </div>

      <el-scrollbar class="policy-scrollbar">
        <div class="policy-content">
          <div class="policy-date">
            <p><strong>更新日期：</strong>{{ updateDate }}</p>
            <p><strong>生效日期：</strong>{{ effectiveDate }}</p>
          </div>
          <slot></slot>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.policy-page {
  height: 100vh;
  background-color: #f8f9fa;
  padding: 40px 20px;
  overflow: hidden;
}

.policy-container {
  max-width: 900px;
  height: calc(100vh - 80px);
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 48px;
  display: flex;
  flex-direction: column;
}

.policy-scrollbar {
  flex: 1;
  overflow: hidden;
}

.policy-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e6eb;
}

.policy-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d2129;
  margin: 0;
}

.policy-content {
  line-height: 1.8;
}

.policy-date {
  background: #f7f8fa;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 32px;

  p {
    margin: 8px 0;
    color: #4e5969;
    font-size: 14px;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2129;
  margin: 32px 0 16px 0;
}

.subsection-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d2129;
  margin: 24px 0 12px 0;
}

.subsubsection-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  margin: 20px 0 10px 0;
}

.section-text {
  font-size: 15px;
  color: #4e5969;
  margin: 12px 0;
  text-align: justify;
}

@media (max-width: 768px) {
  .policy-page {
    padding: 20px 12px;
  }

  .policy-container {
    padding: 24px;
  }

  .policy-title {
    font-size: 24px;
  }

  .section-title {
    font-size: 18px;
  }
}
</style>
