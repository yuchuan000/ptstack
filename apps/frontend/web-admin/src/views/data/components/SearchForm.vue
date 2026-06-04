<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
///////////////////////组件接收参数与事件定义/////////////////////////////
interface FormItem<T> {
  // 表单组件类型
  type: 'input' | 'select' | 'checkbox'
  // 提示标签
  label: string
  // 数据
  dataLabel: keyof T
  // 自定义参数
  params?: {
    // 提示词
    placeholder?: string
    // 标签
    label?: string
    // 选项
    options?: Array<{ value: string | number; label: string }>
  }
}
// 定义接受参数
const props = defineProps<{
  formItems: FormItem<T>[]
  initialValues: T
}>()
// 定义响应事件
defineEmits(['query'])
/////////////////////////数据内部化处理///////////////////////////////
// 深拷贝初始值，用于组件内部操作
const formData = ref(JSON.parse(JSON.stringify(props.initialValues)))
// 获取表单对象，为调取重置方法
const searchForm = ref()
// 重置按钮处理方法
const reset = () => {
  searchForm.value.resetFields()
  console.log('重置成功', formData.value)
}
/////////////////////////样式变化逻辑///////////////////////////////
// 用于控制是否显示更多内容
const isExpand = ref(false)
// 计算操作区的span宽度大小
const operationLength = computed(() => {
  // Math.floor(props.formItems.length / 4)代表整行数
  // props.formItems.length - (props.formItems.length / 4) *4代表最后一行剩下的个数
  if (isExpand.value) {
    // 展开
    if (props.formItems.length % 4 !== 0) {
      // 不单独占一行
      return (
        (props.formItems.length % 4) * 24 -
        (props.formItems.length - Math.floor(props.formItems.length / 4) * 4) *
          6
      )
    } else {
      // 单独占一行
      return 24
    }
  } else {
    // 不展开
    if (props.formItems.length < 3) {
      // 个数小于三
      return 24 - props.formItems.length * 6
    } else {
      // 个数大于等于三
      return 6
    }
  }
})
// 用于判断是否添加顶部外边距
const hasMarginTop = (index: number) => {
  // 如果个数小于等于三，直接不添加
  if (props.formItems.length <= 3) return false
  // 用于判断当前表单元素是否为最后一行
  return index + 1 - Math.floor(props.formItems.length / 4) * 4 > 0
}
</script>

<template>
  <div class="root">
    <el-form
      :model="formData"
      :setInitialValues="props.initialValues"
      ref="searchForm"
    >
      <el-row :gutter="40">
        <!--   数据收集   -->
        <el-col
          :span="6"
          v-for="(item, index) in props.formItems"
          :key="index"
          v-show="index < 3 || isExpand"
          :class="{ 'operation-column-margin-top': hasMarginTop(index) }"
        >
          <el-form-item class="form-items" :prop="item.dataLabel">
            <!--   标签   -->
            <el-text v-if="item.label">{{ item.label }}</el-text>
            <!--   输入框   -->
            <el-input
              v-model="formData[item.dataLabel]"
              :placeholder="item.params?.placeholder"
              v-if="item.type === 'input'"
            />
            <!--   选择框   -->
            <el-select
              v-model="formData[item.dataLabel]"
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
              v-model="formData[item.dataLabel]"
              :label="item.params?.label"
              v-if="item.type === 'checkbox'"
            />
          </el-form-item>
        </el-col>
        <!--   操作栏   -->
        <el-col class="operation-column" :span="operationLength">
          <el-form-item>
            <el-button type="primary" @click="$emit('query', { formData })"
              >查询</el-button
            >
            <el-button @click="reset">重置</el-button>
            <el-button
              text
              v-if="props.formItems.length > 3"
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
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
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
.el-form-item {
  margin-top: 0.5rem;
}
.form-items {
  width: 100%;
}
</style>
