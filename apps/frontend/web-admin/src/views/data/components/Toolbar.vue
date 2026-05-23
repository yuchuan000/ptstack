<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
interface Props {
  deleteButton?: boolean
  restoreButton?: boolean
}

// 接受参数并设置默认值
const props = withDefaults(defineProps<Props>(), {
  deleteButton: false,
  restoreButton: false,
})

defineEmits(['addClick', 'deleteClick', 'restoreClick'])
</script>

<template>
  <el-row>
    <el-col :span="12">
      <el-button type="primary" @click="$emit('addClick')" :icon="Plus">
        新增
      </el-button>
    </el-col>
    <el-col :span="12" class="right">
      <el-button
        type="danger"
        plain
        @click="$emit('deleteClick')"
        v-show="props.deleteButton"
        >删除</el-button
      >
      <el-button
        type="success"
        plain
        @click="$emit('restoreClick')"
        v-show="props.restoreButton"
        >恢复</el-button
      >
    </el-col>
  </el-row>
</template>

<style scoped>
.right {
  display: flex;
  justify-content: right;
}
</style>
