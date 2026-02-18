<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="page-header">
    <div class="header-left">
      <div class="header-info">
        <h1 class="header-title">{{ title }}</h1>
        <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;

    .header-info {
      .header-title {
        font-size: 28px;
        font-weight: 700;
        color: #1d2129;
        margin: 0 0 4px 0;
      }

      .header-subtitle {
        font-size: 14px;
        color: #86909c;
        margin: 0;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
