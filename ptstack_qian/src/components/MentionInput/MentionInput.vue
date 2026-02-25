<template>
  <div class="mention-input-wrapper">
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
    >
      <div
        v-for="(user, index) in filteredUsers"
        :key="user.id"
        class="mention-suggestion-item"
        :class="{ active: index === activeIndex }"
        @click="selectUser(user)"
        @mouseenter="activeIndex = index"
      >
        <img :src="getFullUrl(user.avatar) || '/default-avatar.png'" :alt="user.nickname || user.username" class="mention-avatar" />
        <div class="mention-user-info">
          <div class="mention-username">{{ user.nickname || user.username }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserFollowing } from '@/api/subscriptions'
import { getFullUrl } from '@/utils/url'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  rows: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['update:modelValue', 'mentions'])

const userStore = useUserStore()
const textareaRef = ref(null)
const internalValue = ref(props.modelValue)
const showSuggestions = ref(false)
const searchText = ref('')
const activeIndex = ref(0)
const mentionStartPos = ref(0)
const followingUsers = ref([])
const selectedMentions = ref([])

const ZERO_WIDTH_SPACE = '\u200B'
const ZERO_WIDTH_NON_JOINER = '\u200C'

const generateChecksum = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash % 1000).toString().padStart(3, '0')
}

const filteredUsers = computed(() => {
  if (!searchText.value) return followingUsers.value
  const search = searchText.value.toLowerCase()
  return followingUsers.value.filter(user => {
    const nickname = (user.nickname || '').toLowerCase()
    const username = (user.username || '').toLowerCase()
    return nickname.includes(search) || username.includes(search)
  })
})

const loadFollowingUsers = async () => {
  if (!userStore.userInfo?.id) return
  try {
    const response = await getUserFollowing(userStore.userInfo.id, { pageSize: 100 })
    followingUsers.value = response.users || []
  } catch (error) {
    console.error('加载关注用户列表失败:', error)
  }
}

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

const handleKeydown = (e) => {
  if (!showSuggestions.value) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % filteredUsers.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length
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

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleFocus = () => {
  if (searchText.value) {
    showSuggestions.value = true
  }
}

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
    username: displayName
  })
  emit('update:modelValue', internalValue.value)
  emit('mentions', [...selectedMentions.value])
  showSuggestions.value = false
  searchText.value = ''
  nextTick(() => {
    const newCursorPos = textBefore.length + mentionText.length
    textarea.selectionStart = newCursorPos
    textarea.selectionEnd = newCursorPos
    textarea.focus()
  })
}

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

onMounted(() => {
  loadFollowingUsers()
})
</script>

<style scoped>
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
}

.mention-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
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
}

.mention-suggestion-item:hover,
.mention-suggestion-item.active {
  background-color: #f5f5f5;
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
