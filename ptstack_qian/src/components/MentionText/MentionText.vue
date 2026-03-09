<template>
  <span class="mention-text">
    <component
      v-for="(part, index) in parsedContent"
      :key="index"
      :is="part.type === 'mention' ? 'router-link' : 'span'"
      :to="part.type === 'mention' ? `/profile/${part.userId}` : undefined"
      :class="part.type === 'mention' ? 'mention-tag' : ''"
    >
      {{ part.text }}
    </component>
  </span>
</template>

<script setup>
/**
 * 提及文本组件
 * 用于显示包含@用户提及的文本，将提及部分转换为可点击的链接
 */
import { computed } from 'vue'

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 包含提及的文本内容
   * @type {string}
   * @required
   */
  content: {
    type: String,
    required: true
  }
})



/**
 * 生成校验和
 * @param {string} str - 输入字符串
 * @returns {string} 校验和
 */
const generateChecksum = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash % 1000).toString().padStart(3, '0')
}

/**
 * 解析内容，提取提及部分
 * @type {Array<{type: string, text: string, userId?: string}>
 */
const parsedContent = computed(() => {
  if (!props.content) return [{ type: 'text', text: '' }]

  const parts = []
  const regex = /@([^\u200B]+)\u200B([^\u200B\u200C]+)\u200C(\d{3})\u200B/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(props.content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: props.content.slice(lastIndex, match.index)
      })
    }

    const displayName = match[1]
    const userId = match[2]
    const checksum = match[3]
    const expectedChecksum = generateChecksum(userId)

    if (checksum === expectedChecksum) {
      parts.push({
        type: 'mention',
        text: `@${displayName}`,
        userId: userId
      })
    } else {
      parts.push({
        type: 'text',
        text: `@${displayName}`
      })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < props.content.length) {
    parts.push({
      type: 'text',
      text: props.content.slice(lastIndex)
    })
  }

  return parts
})
</script>

<style lang="scss" scoped>
.mention-text {
  display: inline;
}

.mention-tag {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 0.9em;
  text-decoration: none;
  margin: 0 2px;
  transition: all 0.2s;
  background-color: transparent;

  &:hover {
    background-color: #e6f7ff;
    border-color: #40a9ff;
    color: #40a9ff;
  }
}
</style>
