<script setup lang="ts">
///////////////////////组件接收参数与事件定义/////////////////////////////
// 列配置
import { computed, type Ref, ref } from 'vue'

export interface TableColumns {
  // prop既用于绑定数据，也作为插槽名
  prop: string
  label: string
  isImage?: boolean
  slot?: boolean
}

// 接收参数
const props = defineProps<{
  tableColumns: TableColumns[]
  tableData: any[]
  page: number
  pageSize: number
  total: number
  loading: boolean
  showDeleteBtn: boolean
  showRestoreBtn: boolean
}>()
// 响应事件
const emits = defineEmits([
  'edit',
  'delete',
  'restore',
  'selectionChange',
  'pageChange',
])
/////////////////////////数据内部化处理///////////////////////////////
const pageInner = computed({
  get: () => props.page,
  set: (newValue) =>
    emits('pageChange', { page: newValue, pageSize: props.pageSize }),
})

const pageSizeInner = computed({
  get: () => props.pageSize,
  set: (newValue) =>
    emits('pageChange', { page: props.page, pageSize: newValue }),
})
// 确认操作弹窗
const dialogVisible = ref(false)
const confirmText = ref('确认删除')
const confirmMessage = ref('确认删除吗？')
const confirmButtonType = ref<'danger' | 'success'>('danger')
const action = ref<'delete' | 'restore'>('delete')
const actionTitle = ref('删除操作')
const currentRowData = ref({})
// 删除按钮/恢复按钮点击事件
const deleteClick = (rowData: any) => {
  currentRowData.value = rowData
  confirmText.value = '确认删除'
  confirmMessage.value = `确认删除该条数据吗？ID=${rowData.id}`
  actionTitle.value = '删除操作'
  action.value = 'delete'
  confirmButtonType.value = 'danger'
  dialogVisible.value = true
}
const restoreClick = (rowData: any) => {
  currentRowData.value = rowData
  confirmText.value = '确认恢复'
  confirmMessage.value = `确认恢复该条数据吗？ID=${rowData.id}`
  actionTitle.value = '恢复操作'
  action.value = 'restore'
  confirmButtonType.value = 'success'
  dialogVisible.value = true
}
// 确认执行事件
const confirm = () => {
  dialogVisible.value = false
  emits(action.value, { ...currentRowData.value })
}
// 选中更新事件
const selectionChange = (data: any[]) => {
  const newData = data.map((item: any[]) => {
    return { ...item }
  })
  emits('selectionChange', [...newData])
}
</script>

<template>
  <div class="root">
    <div class="table-list">
      <el-table
        v-loading="props.loading"
        :data="props.tableData"
        style="width: 100%"
        height="100%"
        @selection-change="
          (selectionData: any) => selectionChange(selectionData)
        "
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          v-for="item in props.tableColumns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        >
          <template #default="scope">
            <el-image
              v-if="item.isImage"
              style="width: 3rem; height: 3rem"
              :src="scope.row.icon"
              fit="cover"
              lazy
              :preview-src-list="[scope.row.icon]"
              preview-teleported
            >
              <template #placeholder>
                <el-avatar shape="square" :size="50">{{
                  scope.row.name[0]
                }}</el-avatar>
              </template>
            </el-image>
            <slot v-if="item.slot" :row="scope.row" :name="item.prop" />
          </template>
        </el-table-column>
        <!--  固定操作按钮  -->
        <el-table-column label="操作">
          <template #default="scope">
            <el-button-group>
              <el-button
                text
                size="small"
                @click="$emit('edit', { ...scope.row })"
              >
                编辑
              </el-button>
              <el-button
                text
                size="small"
                v-show="props.showDeleteBtn"
                @click="deleteClick(scope.row)"
              >
                删除
              </el-button>
              <el-button
                text
                size="small"
                v-show="props.showRestoreBtn"
                @click="restoreClick(scope.row)"
              >
                恢复
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <el-pagination
        v-model:current-page="pageInner"
        v-model:page-size="pageSizeInner"
        layout="total, sizes, prev, pager, next, jumper"
        :total="props.total"
      />
    </div>
    <div class="dialog">
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
  </div>
</template>

<style scoped lang="scss">
.root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.table-list {
  flex: 1;
  overflow: scroll;
}
.pagination {
  display: flex;
  justify-content: right;
  padding: 2rem 0;
}
</style>
