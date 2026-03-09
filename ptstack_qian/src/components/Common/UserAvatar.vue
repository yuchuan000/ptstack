<script setup>
import { computed } from 'vue'
import { getFullUrl } from '@/utils/url'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'default', // default, small, tiny, large, profile
    validator: (value) => ['default', 'small', 'tiny', 'large', 'profile'].includes(value),
  },
  showBadge: {
    type: Boolean,
    default: true,
  },
})

const avatarSize = computed(() => {
  switch (props.size) {
    case 'large':
      return 80
    case 'small':
      return 32
    case 'tiny':
      return 28
    case 'profile':
      return 64
    default:
      return 44
  }
})

const badgeSize = computed(() => {
  return Math.round(avatarSize.value * 0.59)
})

const badgeOffset = computed(() => {
  return Math.round(avatarSize.value * -0.136)
})

const badgeFontSize = computed(() => {
  return Math.round(avatarSize.value * 0.27)
})

const displayName = computed(() => {
  return (
    props.user.nickname ||
    props.user.username ||
    props.user.author_nickname ||
    props.user.author_name ||
    'U'
  )
})

const hasCustomBadge = computed(() => {
  return (
    props.showBadge &&
    (props.user.show_avatar_badge ||
      props.user.showAvatarBadge ||
      props.user.author_show_avatar_badge) &&
    (props.user.avatar_badge || props.user.avatarBadge || props.user.author_avatar_badge) &&
    (props.user.avatar_badge_bg_color ||
      props.user.avatarBadgeBgColor ||
      props.user.author_avatar_badge_bg_color) &&
    (props.user.avatar_badge_text_color ||
      props.user.avatarBadgeTextColor ||
      props.user.author_avatar_badge_text_color)
  )
})
</script>

<template>
  <div
    class="user-avatar"
    :class="`avatar-${size}`"
    :style="{
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      fontSize: `${Math.round(avatarSize * 0.41)}px`,
    }"
  >
    <img
      v-if="user.avatar || user.author_avatar"
      :src="getFullUrl(user.avatar || user.author_avatar)"
      :alt="displayName"
      class="user-avatar-img"
    />
    <span v-else class="user-avatar-text">{{ displayName.charAt(0).toUpperCase() }}</span>

    <!-- 自定义标识 -->
    <span
      v-if="hasCustomBadge"
      class="avatar-badge"
      :style="{
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        bottom: `${badgeOffset}px`,
        right: `${badgeOffset}px`,
        fontSize: `${badgeFontSize}px`,
        backgroundColor:
          user.avatar_badge_bg_color ||
          user.avatarBadgeBgColor ||
          user.author_avatar_badge_bg_color ||
          '#165dff',
        color:
          user.avatar_badge_text_color ||
          user.avatarBadgeTextColor ||
          user.author_avatar_badge_text_color ||
          '#ffffff',
      }"
    >
      {{ user.avatar_badge || user.avatarBadge || user.author_avatar_badge }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);

  .user-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    overflow: hidden;
  }

  .user-avatar-text {
    text-align: center;
  }

  .avatar-badge {
    position: absolute;
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 1;
  }
}

.avatar-small {
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.15);
}

.avatar-tiny {
  box-shadow: 0 1px 4px rgba(22, 93, 255, 0.1);
}

.avatar-large {
  box-shadow: 0 8px 24px rgba(22, 93, 255, 0.3);
}

.avatar-profile {
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.25);
}
</style>
