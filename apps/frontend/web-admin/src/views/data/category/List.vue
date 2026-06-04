<script setup lang="ts">
import { ref } from 'vue'
import * as request from './request.ts'
// import type { requestCategorySchemas as requestCategory, returnCategorySchemas as returnCategory } from '@ptstack/types'
import type { requestCategorySchemas as requestCategory } from '@ptstack/types'
///////////////////////////////////
// 搜索表单
import SearchForm from '@/views/data/components/SearchForm.vue'
const queryClick = (data: unknown) => {
  console.log(data)
}

const SearchFormItems = ref([
  {
    type: 'select' as const,
    label: '状态：',
    dataLabel: 'status' as const,
    params: {
      placeholder: '请选择状态',
      options: [
        {
          value: 0,
          label: '私密',
        },
        {
          value: 1,
          label: '正常',
        },
        {
          value: 2,
          label: '全部',
        },
      ],
    },
  },
  {
    type: 'select' as const,
    label: '软删除：',
    dataLabel: 'isDeleted' as const,
    params: {
      placeholder: '请选择',
      options: [
        {
          label: '未删除',
          value: 0,
        },
        {
          label: '已删除',
          value: 1,
        },
      ],
    },
  },
])

const SearchFormData = ref({
  status: 2,
  isDeleted: 0,
})

///////////////////////////////////
// 工具栏
import Toolbar from '@/views/data/components/Toolbar.vue'
const showDeleteBtn = ref(true)

const showRestoreBtn = ref(true)

const addClick = () => {
  console.log('点击了新建按钮')
  // dialogVisible.value = true
  console.log(dialogVisible.value)
}

const deleteClick = () => {
  console.log('点击了删除按钮')
}

const restoreClick = () => {
  console.log('点击了恢复按钮')
}

////////////////////////////////////
// 数据表格
import DataTable from '@/views/data/components/DataTable.vue'
const tableColumns = ref([
  {
    prop: 'id',
    label: 'ID',
  },
  {
    prop: 'name',
    label: '名称',
  },
  {
    prop: 'icon',
    label: '图标',
    isImage: true,
  },
  {
    prop: 'status',
    label: '状态',
  },
  {
    prop: 'sort',
    label: '优先级',
  },
  {
    prop: 'createdAt',
    label: '创建时间',
  },
])
const tableData = ref<any[]>([])
// 分页器
const tableCurrentPage = ref(1)
const tablePageSize = ref(10)
const tableTotal = ref(100)
// 加载器
const tableLoading = ref(false)
// 按钮控制
const tableShowDeleteBtn = ref(true)
const tableShowRestoreBtn = ref(true)
// 事件处理
const handleTableEdit = (data: unknown) => {
  console.log('编辑事件', data)
}
const handleTableDelete = (data: unknown) => {
  console.log('删除事件', data)
}
const handleTableRestore = (data: unknown) => {
  console.log('恢复事件', data)
}
const handleSelectionChange = (data: unknown) => {
  console.log('选中事件', data)
}
const handleTablePageChange = (data: unknown) => {
  console.log('页码改变事件', data)
}
////////////////////////////////////
// 数据请求
const getList = async (params?: requestCategory.GetListQuery) => {
  // if (params?.isDeleted === 0 || params?.isDeleted) {
  //   // 未删除
  //   showDeleteBtn.value = true
  //   showRestoreBtn.value = false
  // } else {
  //   // 已删除
  //
  // }
  tableLoading.value = true
  const res = await request.getListService(params)
  tableData.value = res.data.list
  tableCurrentPage.value = res.data.pagination.page
  tablePageSize.value = res.data.pagination.pageSize
  tableTotal.value = res.data.pagination.total
  tableLoading.value = false
  console.log(tableData.value)
}
getList()

//////////////////////////////////////////
// 新增/编辑弹窗
import DataDialog from '@/views/data/category/components/DataDialog.vue'

const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const dialogData = ref({
  name: '',
  icon: '',
  description: '',
  status: 1,
  sort: 0,
})
const handleDialogSave = (e: unknown) => {
  dialogVisible.value = false
  console.log(e)
}
</script>

<template>
  <div class="list-page">
    <SearchForm
      class="search-form"
      :formItems="SearchFormItems"
      :initialValues="SearchFormData"
      @query="queryClick"
    ></SearchForm>
    <Toolbar
      class="toolbar"
      :showDeleteBtn="showDeleteBtn"
      :showRestoreBtn="showRestoreBtn"
      @create="addClick"
      @delete="deleteClick"
      @restore="restoreClick"
    ></Toolbar>
    <DataTable
      class="data-table"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :currentPage="tableCurrentPage"
      :pageSize="tablePageSize"
      :total="tableTotal"
      :loading="tableLoading"
      :showDeleteBtn="tableShowDeleteBtn"
      :showRestoreBtn="tableShowRestoreBtn"
      @edit="handleTableEdit"
      @delete="handleTableDelete"
      @restore="handleTableRestore"
      @selectionChange="handleSelectionChange"
      @pageChange="handleTablePageChange"
    ></DataTable>
    <DataDialog
      v-model:dialogVisible="dialogVisible"
      :title="dialogTitle"
      :formData="dialogData"
      @save="handleDialogSave"
    ></DataDialog>
  </div>
</template>

<style scoped lang="scss">
.list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.toolbar,
.data-table {
  margin-top: 2rem;
}
</style>
