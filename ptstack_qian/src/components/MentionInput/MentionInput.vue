<template>
  <div class="mention-input-wrapper" @click="handleWrapperClick">
    <textarea
      ref="textareaRef"
      v-model="internalValue"
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="handleBlur"
      @focus="handleFocus"
      class="mention-textarea"
      :placeholder="placeholder"
      :rows="rows"
    ></textarea>

    <div
      v-if="showSuggestions && filteredUsers.length > 0"
      class="mention-suggestions"
      @mousedown="isClickingSuggestion = true"
      @mouseup="isClickingSuggestion = false"
    >
      <div
        v-for="(user, index) in filteredUsers"
        :key="user.id"
        class="mention-suggestion-item"
        :class="{ active: index === activeIndex }"
        @click="selectUser(user)"
        @mouseenter="activeIndex = index"
      >
        <img
          :src="getFullUrl(user.avatar) || '/default-avatar.png'"
          :alt="user.nickname || user.username"
          class="mention-avatar"
        />
        <div class="mention-user-info">
          <div class="mention-username">{{ user.nickname || user.username }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 提及输入组件
 * 支持@用户提及功能，在输入@时显示用户建议列表
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user' // 用户状态管理
import { getUserFollowing } from '@/api/subscriptions' // 获取关注用户列表
import { getFullUrl } from '@/utils/url' // 工具函数，用于获取完整的图片URL

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 输入值，支持v-model双向绑定
   * @type {string}
   * @default ''
   */
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * 占位符文本
   * @type {string}
   * @default '请输入内容...'
   */
  placeholder: {
    type: String,
    default: '请输入内容...',
  },
  /**
   * 文本域行数
   * @type {number}
   * @default 3
   */
  rows: {
    type: Number,
    default: 3,
  },
})

/**
 * 组件事件
 */
const emit = defineEmits([
  'update:modelValue', // 双向更新事件
  'mentions', // 提及用户事件
])

// 状态管理
const userStore = useUserStore() // 用户状态
const textareaRef = ref(null) // 文本域引用
const internalValue = ref(props.modelValue) // 内部输入值
const showSuggestions = ref(false) // 是否显示建议列表
const searchText = ref('') // 搜索文本
const activeIndex = ref(0) // 活动建议索引
const mentionStartPos = ref(0) // 提及开始位置
const followingUsers = ref([]) // 关注用户列表
const selectedMentions = ref([]) // 选中的提及用户
const isClickingSuggestion = ref(false) // 是否正在点击建议列表

// 特殊字符
const ZERO_WIDTH_SPACE = '\u200B' // 零宽空格
const ZERO_WIDTH_NON_JOINER = '\u200C' // 零宽不连字符

/**
 * 生成校验和
 * @param {string} str - 输入字符串
 * @returns {string} 校验和
 */
const generateChecksum = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash % 1000)
    .toString()
    .padStart(3, '0')
}

/**
 * 过滤用户列表
 * @type {Array}
 */
const filteredUsers = computed(() => {
  if (!searchText.value) return followingUsers.value
  const search = searchText.value.toLowerCase()
  return followingUsers.value.filter((user) => {
    const nickname = (user.nickname || '').toLowerCase()
    const username = (user.username || '').toLowerCase()
    return nickname.includes(search) || username.includes(search)
  })
})

/**
 * 加载关注用户列表
 */
const loadFollowingUsers = async () => {
  if (!userStore.userInfo?.id) return
  try {
    const response = await getUserFollowing(userStore.userInfo.id, { pageSize: 100 })
    followingUsers.value = response.users || []
  } catch (error) {
    console.error('加载关注用户列表失败:', error)
  }
}

/**
 * 处理输入事件
 */
const handleInput = () => {
  emit('update:modelValue', internalValue.value)
  const textarea = textareaRef.value
  if (!textarea) return
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = internalValue.value.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  if (lastAtIndex !== -1) {
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    const hasSpace = textAfterAt.includes(' ')
    if (!hasSpace) {
      showSuggestions.value = true
      searchText.value = textAfterAt
      mentionStartPos.value = lastAtIndex
      activeIndex.value = 0
      return
    }
  }
  showSuggestions.value = false
  searchText.value = ''
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} e - 键盘事件对象
 */
const handleKeydown = (e) => {
  if (!showSuggestions.value) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % filteredUsers.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value =
        (activeIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length
      break
    case 'Enter':
    case 'Tab':
      e.preventDefault()
      if (filteredUsers.value[activeIndex.value]) {
        selectUser(filteredUsers.value[activeIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      break
  }
}

/**
 * 处理失去焦点事件
 */
const handleBlur = () => {
  // 检查是否正在点击建议列表
  if (!isClickingSuggestion.value) {
    setTimeout(() => {
      showSuggestions.value = false
    }, 200)
  }
}

/**
 * 处理获得焦点事件
 */
const handleFocus = () => {
  if (searchText.value) {
    showSuggestions.value = true
  }
}

/**
 * 处理包装器点击事件
 * @param {MouseEvent} e - 鼠标事件对象
 */
const handleWrapperClick = (e) => {
  // 点击包装器时，确保textarea获得焦点
  const textarea = textareaRef.value
  if (textarea && e.target !== textarea && !e.target.closest('.mention-suggestions')) {
    textarea.focus()
  }
}

/**
 * 选择用户
 * @param {object} user - 用户对象
 */
const selectUser = (user) => {
  const textarea = textareaRef.value
  if (!textarea) return
  const displayName = user.nickname || user.username
  const checksum = generateChecksum(user.id)
  const mentionText = `@${displayName}${ZERO_WIDTH_SPACE}${user.id}${ZERO_WIDTH_NON_JOINER}${checksum}${ZERO_WIDTH_SPACE} `
  const textBefore = internalValue.value.substring(0, mentionStartPos.value)
  const textAfter = internalValue.value.substring(textarea.selectionStart)
  internalValue.value = textBefore + mentionText + textAfter
  selectedMentions.value.push({
    userId: user.id,
    username: displayName,
  })
  emit('update:modelValue', internalValue.value)
  emit('mentions', [...selectedMentions.value])
  showSuggestions.value = false
  searchText.value = ''
  // 直接设置光标位置，不需要nextTick
  const newCursorPos = textBefore.length + mentionText.length
  textarea.selectionStart = newCursorPos
  textarea.selectionEnd = newCursorPos
  textarea.focus()
}

/**
 * 监听modelValue变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  },
)

/**
 * 组件挂载时加载关注用户列表
 */
onMounted(() => {
  loadFollowingUsers()
})
</script>

<style lang="scss" scoped>
.mention-input-wrapper {
  position: relative;
  width: 100%;
}

.mention-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
}

.mention-suggestions {
  position: absolute;
  top: 80px;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 240px;
  overflow-y: auto;
  min-width: 200px;
}

.mention-suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover,
  &.active {
    background-color: #f5f5f5;
  }
}

.mention-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.mention-user-info {
  flex: 1;
  min-width: 0;
}

.mention-username {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}
</style>
