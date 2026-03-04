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
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

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

const parsedContent = computed(() => {
  if (!props.content) return [{ type: 'text', text: '' }]

  const parts = []
  const regex = new RegExp(`@([^${ZERO_WIDTH_SPACE}]+)${ZERO_WIDTH_SPACE}([^${ZERO_WIDTH_SPACE}${ZERO_WIDTH_NON_JOINER}]+)${ZERO_WIDTH_NON_JOINER}(\\d{3})${ZERO_WIDTH_SPACE}`, 'g')
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
