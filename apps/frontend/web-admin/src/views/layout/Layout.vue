<script setup lang="ts">
import Menu from '@/views/layout/menu/Menu.vue'
import Breadcrumb from '@/views/layout/Breadcrumb.vue'
import Collapse from '@/views/layout/menu/Collapse.vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!--  左边栏  -->
      <el-aside width="auto">
        <Menu></Menu>
      </el-aside>
      <!--  右边区  -->
      <el-container>
        <!--  右-顶部区  -->
        <el-header>
          <Collapse class="collapse-btn"></Collapse>
          <Breadcrumb></Breadcrumb>
        </el-header>
        <!--  右-内容区  -->
        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.common-layout,
.el-container,
.el-aside {
  height: 100vh;
}
.el-main {
  height: 100%;
}
.el-header {
  display: flex;
  align-items: center;
  .collapse-btn {
    margin-right: 1rem;
  }
}
</style>
