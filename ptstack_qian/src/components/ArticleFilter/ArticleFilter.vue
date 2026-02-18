<script setup>
// 文章筛选组件 - 提供分类选择和搜索功能
import { Search } from '@element-plus/icons-vue' // 导入搜索图标

// 定义组件接收的属性
const props = defineProps({
  // 是否显示分类选择器，默认显示
  showCategory: {
    type: Boolean, // 属性类型为布尔值
    default: true // 默认值为true
  },
  // 分类列表数据
  categories: {
    type: Array, // 属性类型为数组
    default: () => [] // 默认值为空数组
  },
  // 筛选值对象，包含分类和搜索关键词，支持v-model双向绑定
  modelValue: {
    type: Object, // 属性类型为对象
    default: () => ({ category: '', search: '' }) // 默认值对象
  },
  // 搜索框的占位符文本
  searchPlaceholder: {
    type: String, // 属性类型为字符串
    default: '搜索文章标题或内容...' // 默认占位符文本
  }
})

// 定义组件触发的事件
const emit = defineEmits(['update:modelValue', 'search']) // 双向更新事件和搜索事件

// 处理分类选择变化
const handleCategoryChange = (value) => {
  // 触发更新事件，保持原有搜索值，更新分类值
  emit('update:modelValue', { ...props.modelValue, category: value })
  emit('search') // 触发搜索事件
}

// 处理搜索输入变化
const handleSearchInput = (value) => {
  // 触发更新事件，保持原有分类值，更新搜索值
  emit('update:modelValue', { ...props.modelValue, search: value })
  emit('search') // 触发搜索事件
}

// 处理搜索框清空
const handleSearchClear = () => {
  // 触发更新事件，保持原有分类值，清空搜索值
  emit('update:modelValue', { ...props.modelValue, search: '' })
  emit('search') // 触发搜索事件
}
</script>

<template>
  <div class="article-filter">
    <el-select
      v-if="showCategory"
      :model-value="modelValue.category"
      placeholder="选择分类"
      clearable
      @change="handleCategoryChange"
      class="category-select"
    >
      <el-option
        v-for="cat in categories"
        :key="cat.id"
        :label="cat.name"
        :value="cat.id"
      />
    </el-select>
    <div class="search-box">
      <el-input
        :model-value="modelValue.search"
        :placeholder="searchPlaceholder"
        clearable
        @clear="handleSearchClear"
        @input="handleSearchInput"
        @keyup.enter="handleSearchInput(modelValue.search)"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-filter {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.category-select {
  width: 140px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    padding: 8px 16px;
  }
}

.search-box {
  width: 320px;
}

.search-input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    padding: 8px 16px;
  }
}

@media (max-width: 768px) {
  .article-filter {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    .category-select,
    .search-box {
      width: 100%;
    }
  }
}
</style>
