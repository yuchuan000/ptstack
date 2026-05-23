<script setup lang="ts">
///////////////////////////////////
// 搜索表单
import SearchForm from '@/views/data/components/SearchForm.vue'
import { searchFormArray, queryClick, resetClick } from './ListTs/SearchForm.ts'

///////////////////////////////////
// 工具栏
import Toolbar from '@/views/data/components/Toolbar.vue'
import {
  deleteButton,
  restoreButton,
  addClick,
  deleteClick,
  restoreClick,
} from './ListTs/Toolbar.ts'

////////////////////////////////////
// 数据表格
import DataTable from '@/views/data/components/DataTable.vue'
import { tableConfig, tableButtonClick } from './ListTs/DataTable.ts'

////////////////////////////////////
// 分页器
import { currentPage, pageSize, total } from './ListTs/Pagination.ts'
</script>

<template>
  <div class="list-page">
    <div class="search-form">
      <SearchForm
        :SearchFormArray="searchFormArray"
        @query-click="queryClick"
        @reset-click="resetClick"
      ></SearchForm>
    </div>
    <div class="toolbar">
      <Toolbar
        :deleteButton="deleteButton"
        :restoreButton="restoreButton"
        @addClick="addClick"
        @deleteClick="deleteClick"
        @restoreClick="restoreClick"
      ></Toolbar>
    </div>
    <div class="data-table">
      <DataTable
        @buttonClick="tableButtonClick"
        :tableConfig="tableConfig"
      ></DataTable>
    </div>
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>
  </div>
</template>

<style scoped>
.toolbar,
.data-table {
  margin-top: 2rem;
}
.list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  .data-table {
    flex: 1;
    overflow: scroll;
  }
  .pagination {
    display: flex;
    justify-content: right;
    padding: 2rem 0;
  }
}
</style>
