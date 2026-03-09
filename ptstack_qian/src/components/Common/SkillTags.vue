<script setup>
/**
 * 技能标签组件
 * 用于添加和管理技能标签
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 技能标签数组，支持v-model双向绑定
   * @type {Array<string>}
   * @default []
   */
  modelValue: {
    type: Array,
    default: () => [],
  },
})

/**
 * 组件事件
 */
const emit = defineEmits([
  'update:modelValue', // 双向更新事件
])

/**
 * 技能输入值
 * @type {string}
 */
const skillInput = ref('')

/**
 * 添加技能
 */
const addSkill = () => {
  const skill = skillInput.value.trim()
  if (!skill) return
  if (props.modelValue.includes(skill)) {
    ElMessage.warning('该技能已存在')
    return
  }
  const newSkills = [...props.modelValue, skill]
  emit('update:modelValue', newSkills)
  skillInput.value = ''
}

/**
 * 删除技能
 * @param {number} index - 技能索引
 */
const removeSkill = (index) => {
  const newSkills = [...props.modelValue]
  newSkills.splice(index, 1)
  emit('update:modelValue', newSkills)
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} event - 键盘事件对象
 */
const handleKeyUp = (event) => {
  if (event.key === 'Enter') {
    addSkill()
  }
}
</script>

<template>
  <div class="skill-tags-wrapper">
    <div class="skills-input-wrapper">
      <el-input
        v-model="skillInput"
        placeholder="输入技能后按回车添加"
        @keyup.enter="handleKeyUp"
      />
      <el-button type="primary" @click="addSkill">添加</el-button>
    </div>
    <div class="skills-list">
      <el-tag
        v-for="(skill, index) in modelValue"
        :key="skill"
        closable
        @close="removeSkill(index)"
      >
        {{ skill }}
      </el-tag>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skill-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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
</style>
