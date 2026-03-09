<script setup>
/**
 * 标签容器组件
 * 用于展示可切换的标签页
 */

/**
 * 组件属性
 */
defineProps({
  /**
   * 标签数组
   * @type {Array<{key: string, label: string, icon?: any}>}
   * @required
   */
  tabs: {
    type: Array,
    required: true,
  },
  /**
   * 当前激活的标签键值
   * @type {string}
   * @required
   */
  activeTab: {
    type: String,
    required: true,
  },
})

/**
 * 组件事件
 */
const emit = defineEmits([
  /**
   * 标签切换事件
   * @param {string} key - 切换的标签键值
   */
  'tab-change',
])

/**
 * 处理标签点击事件
 * @param {string} key - 点击的标签键值
 */
const handleTabClick = (key) => {
  emit('tab-change', key)
}
</script>

<template>
  <div class="tabs-section">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: activeTab === tab.key }"
      @click="handleTabClick(tab.key)"
    >
      <el-icon v-if="tab.icon">
        <component :is="tab.icon" />
      </el-icon>
      {{ tab.label }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabs-section {
  display: flex;
  gap: 8px;
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
</style>
