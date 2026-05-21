<script setup lang="ts">
import { Fold, Expand } from '@element-plus/icons-vue'
// 读取菜单展开状态数据
import { useLayoutStore } from '@/stores/LayoutStore.ts'
const layoutStore = useLayoutStore()
</script>

<template>
  <el-icon @click="layoutStore.changeCollapse">
    <Fold v-show="!layoutStore.isCollapse" />
    <Expand v-show="layoutStore.isCollapse" />
  </el-icon>
</template>

<style scoped lang="scss">
.el-icon {
  cursor: pointer;
}
</style>
