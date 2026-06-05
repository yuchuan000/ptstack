// import { ref } from 'vue'
// import * as request from './request.ts'
// // import type { requestCategorySchemas as requestCategory, returnCategorySchemas as returnCategory } from '@ptstack/types'
// import type { requestCategorySchemas as requestCategory } from '@ptstack/types'
// // 命名规范：
// // 普通变量名：组件名（大驼峰）_变量名(小驼峰)
// // 控制器变量名： 组件名（大驼峰）_show+变量名(整体小驼峰)
// // 处理函数名：组件名（大驼峰）_handle+事件名(整体小驼峰)
//
// export function useCategoryList() {
//     // ==========搜索表单==========
//     // 表单元素配置
//     const SearchForm_items = ref([
//         {
//             type: 'select' as const,
//             label: '状态：',
//             dataLabel: 'status' as const,
//             params: {
//                 placeholder: '请选择状态',
//                 options: [
//                     {
//                         value: 0,
//                         label: '私密',
//                     },
//                     {
//                         value: 1,
//                         label: '正常',
//                     },
//                     {
//                         value: 2,
//                         label: '全部',
//                     },
//                 ],
//             },
//         },
//         {
//             type: 'select' as const,
//             label: '软删除：',
//             dataLabel: 'isDeleted' as const,
//             params: {
//                 placeholder: '请选择',
//                 options: [
//                     {
//                         label: '未删除',
//                         value: 0,
//                     },
//                     {
//                         label: '已删除',
//                         value: 1,
//                     },
//                 ],
//             },
//         },
//     ])
//     // 表单初始数据
//     const SearchForm_initialData = ref({
//         status: 2,
//         isDeleted: 0,
//     })
//     // 查询事件
//     const SearchForm_handleQuery = (data: unknown) => {
//         console.log(data)
//     }
//
//     // ==========工具栏==========
//     // 按钮控制器
//     const Toolbar_showDeleteBtn = ref(true)
//     const Toolbar_showRestoreBtn = ref(true)
//     // 新增事件
//     const Toolbar_handleAdd = () => {
//         console.log('点击了新建按钮')
//         // dialogVisible.value = true
//         console.log(DataDialog_showDialog.value)
//     }
//     // 删除事件
//     const Toolbar_handleDelete = () => {
//         console.log('点击了删除按钮')
//     }
//     // 恢复事件
//     const Toolbar_handleRestore = () => {
//         console.log('点击了恢复按钮')
//     }
//     // ==========数据表格==========
//     // 表格列配置
//     const DataTable_columns = ref([
//         {
//             prop: 'id',
//             label: 'ID',
//         },
//         {
//             prop: 'name',
//             label: '名称',
//         },
//         {
//             prop: 'icon',
//             label: '图标',
//             isImage: true,
//         },
//         {
//             prop: 'status',
//             label: '状态',
//         },
//         {
//             prop: 'sort',
//             label: '优先级',
//         },
//         {
//             prop: 'createdAt',
//             label: '创建时间',
//         },
//     ])
//     // 表格数据
//     const DataTable_data = ref<any[]>([])
//     // 分页器
//     const DataTable_currentPage = ref(1)
//     const DataTable_pageSize = ref(10)
//     const DataTable_total = ref(100)
//     // 加载控制器
//     const DataTable_showLoading = ref(false)
//     // 按钮控制器
//     const DataTable_showDeleteBtn = ref(true)
//     const DataTable_showRestoreBtn = ref(true)
//     // 事件处理
//     const DataTable_handleEdit = (data: unknown) => {
//         console.log('编辑事件', data)
//     }
//     const DataTable_handleDelete = (data: unknown) => {
//         console.log('删除事件', data)
//     }
//     const DataTable_handleRestore = (data: unknown) => {
//         console.log('恢复事件', data)
//     }
//     const DataTable_handleSelectionChange = (data: unknown) => {
//         console.log('选中事件', data)
//     }
//     const DataTable_handlePageChange = (data: unknown) => {
//         console.log('页码改变事件', data)
//     }
//
//     // ==========数据请求==========
//     const DataTable_getData = async (params?: requestCategory.GetListQuery) => {
//         // if (params?.isDeleted === 0 || params?.isDeleted) {
//         //   // 未删除
//         //   showDeleteBtn.value = true
//         //   showRestoreBtn.value = false
//         // } else {
//         //   // 已删除
//         //
//         // }
//         DataTable_showLoading.value = true
//         const res = await request.getListService(params)
//         DataTable_data.value = res.data.list
//         DataTable_currentPage.value = res.data.pagination.page
//         DataTable_pageSize.value = res.data.pagination.pageSize
//         DataTable_total.value = res.data.pagination.total
//         DataTable_showLoading.value = false
//         console.log(DataTable_data.value)
//     }
//
//     // ==========新增/编辑弹窗==========
//     const DataDialog_showDialog = ref(false)
//     const DataDialog_title = ref('新增分类')
//     const DataDialog_data = ref({
//         name: '',
//         icon: '',
//         description: '',
//         status: 1,
//         sort: 0,
//     })
//     const DataDialog_handleSave = (e: unknown) => {
//         DataDialog_showDialog.value = false
//         console.log(e)
//     }
//
//
//     // ==========统一导出==========
//     return {
//         SearchForm_items,
//         SearchForm_initialData,
//         SearchForm_handleQuery,
//         Toolbar_showDeleteBtn,
//         Toolbar_showRestoreBtn,
//         Toolbar_handleAdd,
//         Toolbar_handleDelete,
//         Toolbar_handleRestore,
//         DataTable_columns,
//         DataTable_data,
//         DataTable_currentPage,
//         DataTable_pageSize,
//         DataTable_total,
//         DataTable_showLoading,
//         DataTable_showDeleteBtn,
//         DataTable_showRestoreBtn,
//         DataTable_handleEdit,
//         DataTable_handleDelete,
//         DataTable_handleRestore,
//         DataTable_handleSelectionChange,
//         DataTable_handlePageChange,
//         DataTable_getData,
//         DataDialog_showDialog,
//         DataDialog_title,
//         DataDialog_data,
//         DataDialog_handleSave
//     }
// }
const a = 1
console.log(a)
