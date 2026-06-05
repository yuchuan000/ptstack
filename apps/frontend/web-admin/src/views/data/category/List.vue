<script setup lang="ts">
import SearchForm from '@/views/data/components/SearchForm.vue'
import Toolbar from '@/views/data/components/Toolbar.vue'
import DataTable from '@/views/data/components/DataTable.vue'
import DataDialog from '@/views/data/category/components/DataDialog.vue'

import { useCategoryList } from '@/views/data/category/useCategoryList.ts'
const {
  SearchForm_items,
  SearchForm_initialData,
  SearchForm_handleQuery,
  Toolbar_showDeleteBtn,
  Toolbar_showRestoreBtn,
  Toolbar_handleAdd,
  Toolbar_handleDelete,
  Toolbar_handleRestore,
  DataTable_columns,
  DataTable_data,
  DataTable_page,
  DataTable_pageSize,
  DataTable_total,
  DataTable_showLoading,
  DataTable_showDeleteBtn,
  DataTable_showRestoreBtn,
  DataTable_handleEdit,
  DataTable_handleDelete,
  DataTable_handleRestore,
  DataTable_handleSelectionChange,
  DataTable_handlePageChange,
  DataTable_formatDate,
  DataTable_getData,
  DataDialog_showDialog,
  DataDialog_title,
  DataDialog_data,
  DataDialog_handleSave,
} = useCategoryList()

DataTable_getData()
</script>

<template>
  <div class="list-page">
    <SearchForm
      class="search-form"
      :formItems="SearchForm_items"
      :initialValues="SearchForm_initialData"
      @query="SearchForm_handleQuery"
    ></SearchForm>
    <Toolbar
      class="toolbar"
      :showDeleteBtn="Toolbar_showDeleteBtn"
      :showRestoreBtn="Toolbar_showRestoreBtn"
      @create="Toolbar_handleAdd"
      @delete="Toolbar_handleDelete"
      @restore="Toolbar_handleRestore"
    ></Toolbar>
    <DataTable
      class="data-table"
      :tableColumns="DataTable_columns"
      :tableData="DataTable_data"
      :page="DataTable_page"
      :pageSize="DataTable_pageSize"
      :total="DataTable_total"
      :loading="DataTable_showLoading"
      :showDeleteBtn="DataTable_showDeleteBtn"
      :showRestoreBtn="DataTable_showRestoreBtn"
      @edit="DataTable_handleEdit"
      @delete="DataTable_handleDelete"
      @restore="DataTable_handleRestore"
      @selectionChange="DataTable_handleSelectionChange"
      @pageChange="DataTable_handlePageChange"
    >
      <template #status="{ row }">
        <el-tag
          v-show="row.status === 1"
          type="primary"
          :disable-transitions="true"
          >正常</el-tag
        >
        <el-tag
          v-show="row.status === 0"
          type="info"
          :disable-transitions="true"
          >私密</el-tag
        >
      </template>
      <template #sort="{ row }">
        <el-tag
          v-if="row.sort >= 75"
          type="danger"
          effect="plain"
          :disable-transitions="true"
          >{{ row.sort }}</el-tag
        >
        <el-tag
          v-else-if="row.sort >= 50"
          type="warning"
          effect="plain"
          :disable-transitions="true"
          >{{ row.sort }}</el-tag
        >
        <el-tag
          v-else-if="row.sort >= 25"
          type="success"
          effect="plain"
          :disable-transitions="true"
          >{{ row.sort }}</el-tag
        >
        <el-tag
          v-else-if="row.sort > 0"
          type="primary"
          effect="plain"
          :disable-transitions="true"
          >{{ row.sort }}</el-tag
        >
        <el-tag
          v-else-if="row.sort === 0"
          type="info"
          effect="plain"
          :disable-transitions="true"
          >{{ row.sort }}</el-tag
        >
      </template>
      <template #createdAt="{ row }">
        {{ DataTable_formatDate(row.createAt) }}
      </template>
    </DataTable>
    <DataDialog
      v-model:dialogVisible="DataDialog_showDialog"
      :title="DataDialog_title"
      :formData="DataDialog_data"
      @save="DataDialog_handleSave"
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
