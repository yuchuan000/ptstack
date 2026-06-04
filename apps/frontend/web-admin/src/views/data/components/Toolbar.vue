<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ref } from 'vue'
///////////////////////组件接收参数与事件定义/////////////////////////////
interface Props {
  showDeleteBtn?: boolean
  showRestoreBtn?: boolean
}
// 接受参数并设置默认值
const props = withDefaults(defineProps<Props>(), {
  showDeleteBtn: false,
  showRestoreBtn: false,
})
// 事件
const emits = defineEmits(['create', 'delete', 'restore'])
/////////////////////////数据内部化处理///////////////////////////////
const dialogVisible = ref(false)
const confirmText = ref('确认批量删除')
const confirmMessage = ref('确认批量删除吗？')
const actionTitle = ref('批量删除操作')
const confirmButtonType = ref<'danger' | 'success'>('danger')
const action = ref<'delete' | 'restore'>('delete')
// 删除按钮/恢复按钮点击事件
const deleteClick = () => {
  confirmText.value = '确认批量删除'
  confirmMessage.value = '确认批量删除吗？'
  actionTitle.value = '批量删除操作'
  action.value = 'delete'
  confirmButtonType.value = 'danger'
  dialogVisible.value = true
}
const restoreClick = () => {
  confirmText.value = '确认批量恢复'
  confirmMessage.value = '确认批量恢复吗？'
  actionTitle.value = '批量恢复操作'
  action.value = 'restore'
  confirmButtonType.value = 'success'
  dialogVisible.value = true
}
// 确认执行事件
const confirm = () => {
  dialogVisible.value = false
  emits(action.value)
}
</script>

<template>
  <div class="root">
    <el-row>
      <el-col :span="12">
        <el-button type="primary" @click="$emit('create')" :icon="Plus">
          新增
        </el-button>
      </el-col>
      <el-col :span="12" class="right">
        <el-button
          type="danger"
          plain
          @click="deleteClick"
          v-show="props.showDeleteBtn"
          >删除</el-button
        >
        <el-button
          type="success"
          plain
          @click="restoreClick"
          v-show="props.showRestoreBtn"
          >恢复</el-button
        >
      </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" :title="actionTitle" width="500">
      <span>{{ confirmMessage }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button :type="confirmButtonType" @click="confirm">
            {{ confirmText }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.right {
  display: flex;
  justify-content: right;
}
</style>
