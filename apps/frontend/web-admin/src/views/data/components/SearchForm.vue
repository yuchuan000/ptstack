<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

interface SearchFormArrayItem {
  type: string
  label?: string
  params?: {
    placeholder?: string
    label?: string
    options?: Array<{ value: string; label: string }>
  }
  data: string | boolean
}

// 定义接受参数
const props = defineProps<{
  SearchFormArray: SearchFormArrayItem[]
}>()

// 定义响应事件
defineEmits(['queryClick', 'resetClick'])

// 用于控制是否显示更多内容
const isExpand = ref(false)

// 计算操作区的span宽度大小
const operationLength = computed(() => {
  // Math.floor(props.SearchFormArray.length / 4)代表整行数
  // props.SearchFormArray.length - (props.SearchFormArray.length / 4) *4代表最后一行剩下的个数

  if (isExpand.value) {
    // 展开
    if (props.SearchFormArray.length % 4 !== 0) {
      // 不单独占一行
      return (
        (props.SearchFormArray.length % 4) * 24 -
        (props.SearchFormArray.length -
          Math.floor(props.SearchFormArray.length / 4) * 4) *
          6
      )
    } else {
      // 单独占一行
      return 24
    }
  } else {
    // 不展开
    if (props.SearchFormArray.length < 3) {
      // 个数小于三
      return 24 - props.SearchFormArray.length * 6
    } else {
      // 个数大于等于三
      return 6
    }
  }
})
// 用于判断是否添加顶部外边距
const hasMarginTop = (index: number) => {
  // 如果个数小于等于三，直接不添加
  if (props.SearchFormArray.length <= 3) return false
  // 用于判断当前表单元素是否为最后一行
  return index + 1 - Math.floor(props.SearchFormArray.length / 4) * 4 > 0
}
</script>

<template>
  <el-row :gutter="40">
    <!--   数据收集   -->
    <el-col
      :span="6"
      v-for="(item, index) in props.SearchFormArray"
      :key="index"
      v-show="index < 3 || isExpand"
      :class="{ 'operation-column-margin-top': hasMarginTop(index) }"
    >
      <!--   标签   -->
      <el-text v-if="item.label">{{ item.label }}</el-text>
      <!--   输入框   -->
      <el-input
        v-model="item.data"
        :placeholder="item.params?.placeholder"
        v-if="item.type === 'input'"
      />
      <!--   选择框   -->
      <el-select
        v-model="item.data"
        :placeholder="item.params?.placeholder"
        v-if="item.type === 'select'"
      >
        <el-option
          v-for="option in item.params?.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <!--   单个多选框（用于两种状态切换）   -->
      <el-checkbox
        v-model="item.data"
        :label="item.params?.label"
        v-if="item.type === 'checkbox'"
      />
    </el-col>
    <!--   操作栏   -->
    <el-col
      class="operation-column"
      :class="{ 'operation-column-margin-top': isExpand }"
      :span="operationLength"
    >
      <el-button type="primary" @click="$emit('queryClick')">查询</el-button>
      <el-button @click="$emit('resetClick')">重置</el-button>
      <el-button
        text
        v-if="props.SearchFormArray.length > 3"
        @click="isExpand = !isExpand"
      >
        <el-text style="margin-right: 0.3rem" type="primary">{{
          isExpand ? '收起' : '展开'
        }}</el-text>
        <el-icon color="#409EFF" class="expand-icon">
          <ArrowDown v-show="!isExpand" />
          <ArrowUp v-show="isExpand" />
        </el-icon>
      </el-button>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.el-col {
  display: flex;
  .el-input,
  .el-select {
    flex: 1;
  }
}
.expand-icon {
  color: $color-primary;
}
.operation-column {
  justify-content: end;
}
.operation-column-margin-top {
  margin-top: 1.5rem;
}
</style>
