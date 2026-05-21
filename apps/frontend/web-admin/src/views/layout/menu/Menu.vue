<script setup lang="ts">
import { DataBoard, Document, Setting, Eleme } from '@element-plus/icons-vue'
// 读取菜单展开状态数据
import { useLayoutStore } from '@/stores/LayoutStore.ts'
const layoutStore = useLayoutStore()
// 获取当前路由
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <el-menu
    :default-active="route.fullPath"
    class="el-menu-vertical-demo"
    :default-openeds="['1', '2', '3']"
    router
    :collapse="layoutStore.isCollapse"
  >
    <el-menu-item class="site-title" index="/">
      <el-icon><Eleme /></el-icon>
      <span class="title-text">个人技术栈管理</span>
    </el-menu-item>
    <el-sub-menu index="1">
      <template #title>
        <el-icon><DataBoard /></el-icon>
        <span>控制面板</span>
      </template>
      <el-menu-item index="/dashboard/console">主控台</el-menu-item>
      <el-menu-item index="/dashboard/workplace">工作台</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="2">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>数据管理</span>
      </template>
      <el-menu-item index="/data/articles">文章管理</el-menu-item>
      <el-menu-item index="/data/categories">分类管理</el-menu-item>
      <el-menu-item index="/data/attachments">附件管理</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </template>
      <el-menu-item index="/setting/password">修改密码</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped lang="scss">
.el-menu {
  height: 100%;
}
.site-title {
  cursor: default;
}
</style>
