import { computed, type Ref, ref } from 'vue'
import * as request from './request.ts'
// import type { requestCategorySchemas as requestCategory, returnCategorySchemas as returnCategory } from '@ptstack/types'
import type {Category} from '@ptstack/types/src/schema/common'
import type { TableColumns } from '../components/DataTable.vue'
import dayjs from 'dayjs'
// 命名规范：
// 普通变量名：组件名（大驼峰）_变量名(小驼峰)
// 控制器变量名： 组件名（大驼峰）_show+变量名(整体小驼峰)
// 处理函数名：组件名（大驼峰）_handle+事件名(整体小驼峰)

export function useCategoryList() {
  // <editor-fold> ==========搜索表单==========
  // 表单元素配置
  const SearchForm_items = ref([
    {
      type: 'select' as const,
      label: '状态：',
      dataLabel: 'status' as const,
      params: {
        placeholder: '请选择状态',
        options: [
          {
            value: 'PRIVATE',
            label: '私密',
          },
          {
            value: 'PUBLIC',
            label: '正常',
          },
          {
            value: 'ALL',
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
  // 表单初始数据
  const SearchForm_initialData = ref({
    status: 'ALL',
    isDeleted: 0,
  })
  // 查询事件
  const SearchForm_handleQuery = async (
    query: Category.Request.GetListQuery,
  ) => {
    // 更新数据
    await DataTable_getData(query)
  }
  // </editor-fold>

  // <editor-fold> ==========工具栏==========
  // 按钮控制器
  const Toolbar_showDeleteBtn = ref(false)
  const Toolbar_showRestoreBtn = ref(false)
  // 新增事件
  const Toolbar_handleAdd = () => {
    // 清空弹窗表单
    DataDialog_data.value = { ...DataDialog_initialData }
    // 更新操作标记为新增
    DataDialog_operationSign.value = 'add'
    // 显示弹窗
    DataDialog_showDialog.value = true
  }
  // 删除事件
  const Toolbar_handleDelete = async () => {
    const idList = DataTable_selectionList.value.map((item) => item.id)
    const res = await request.softDeleteManyService({ id: idList })
    console.log(res)
    // 刷新列表数据
    await DataTable_getData()
  }
  // 恢复事件
  const Toolbar_handleRestore = async () => {
    const idList = DataTable_selectionList.value.map((item) => item.id)
    const res = await request.restoreManyService({ id: idList })
    console.log(res)
    // 刷新数据列表（保持查看删除列表）
    await DataTable_getData({ isDeleted: 1 })
  }
  // </editor-fold>

  // <editor-fold> ==========数据表格==========
  // 表格列配置
  const DataTable_columns: Ref<TableColumns[]> = ref([
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
      slot: true,
    },
    {
      prop: 'priority',
      label: '优先级',
      slot: true,
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      slot: true,
    },
  ])
  // 表格数据
  const DataTable_data = ref<any[]>([])
  // 分页器
  const DataTable_page = ref(1)
  const DataTable_pageSize = ref(10)
  const DataTable_total = ref(100)
  // 加载控制器
  const DataTable_showLoading = ref(false)
  // 按钮控制器
  const DataTable_showDeleteBtn = ref(true)
  const DataTable_showRestoreBtn = ref(false)
  // 选中的数据列表
  const DataTable_selectionList = ref<Category.Database.CategoryBaseMustWrite[]>([])
  // 事件处理
  const DataTable_handleEdit = (data: Category.Database.CategoryBaseMustWrite) => {
    // 更新操作标记为编辑
    DataDialog_operationSign.value = 'edit'
    // 传递编辑的id
    DataDialog_currentId.value = data.id
    // 回显表单
    DataDialog_data.value.name = data.name ?? DataDialog_initialData.name
    DataDialog_data.value.icon = data.icon ?? DataDialog_initialData.icon
    DataDialog_data.value.description =
      data.description ?? DataDialog_initialData.description
    DataDialog_data.value.status = data.status ?? DataDialog_initialData.status
    DataDialog_data.value.priority = data.priority ?? DataDialog_initialData.priority
    DataDialog_showDialog.value = true
  }
  const DataTable_handleDelete = async (data: Category.Database.CategoryBaseMustWrite) => {
    // 请求数据
    const res = await request.softDeleteService({ id: data.id })
    console.log('删除事件', res)
    // 刷新列表数据
    await DataTable_getData()
  }
  const DataTable_handleRestore = async (data: Category.Database.CategoryBaseMustWrite) => {
    console.log('恢复事件', data)
    // 发送请求
    await request.restoreService({ id: data.id })
    // 刷新数据列表（保持查看删除列表）
    await DataTable_getData({ isDeleted: 1 })
  }
  const DataTable_handleSelectionChange = (
    data: Category.Database.CategoryBaseMustWrite[],
  ) => {
    console.log('选中事件', data)
    // 控制工具栏按钮
    if (!data[0]) {
      // 没有选中项，恢复默认，都隐藏
      Toolbar_showDeleteBtn.value = false
      Toolbar_showRestoreBtn.value = false
    } else if (data[0].deletedAt === null) {
      // 未删除数据：显示批量删除按钮
      Toolbar_showDeleteBtn.value = true
      Toolbar_showRestoreBtn.value = false
    } else {
      // 已删除数据：显示批量恢复按钮
      Toolbar_showDeleteBtn.value = false
      Toolbar_showRestoreBtn.value = true
    }
    // 保存选中数组
    DataTable_selectionList.value = [...data]
  }
  const DataTable_handlePageChange = async (data: {
    page: number
    pageSize: number
  }) => {
    console.log(data)
    await DataTable_getData(data)
  }
  // 显示数据格式化
  const DataTable_formatDate = (date: any) =>
    dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  // </editor-fold>

  // <editor-fold> ==========数据请求==========
  const DataTable_getData = async (params?: Category.Request.GetListQuery) => {
    // 开启加载器
    DataTable_showLoading.value = true
    // 获取表格数据
    const res = await request.getListService(params)
    // 回显表格数据
    DataTable_data.value = res.data.list
    // 回显分页器数据
    DataTable_page.value = res.data.pagination.page
    DataTable_pageSize.value = res.data.pagination.pageSize
    DataTable_total.value = res.data.pagination.total
    // 修改操作按钮
    if (params?.isDeleted === 0 || params?.isDeleted === undefined) {
      // 未删除：显示删除按钮
      DataTable_showDeleteBtn.value = true
      DataTable_showRestoreBtn.value = false
    } else {
      // 已删除：显示恢复按钮
      DataTable_showDeleteBtn.value = false
      DataTable_showRestoreBtn.value = true
    }
    // 关闭加载器
    DataTable_showLoading.value = false
  }
  // </editor-fold>

  // <editor-fold> ==========新增/编辑弹窗==========
  // ====不导出的内部数据====
  // 初始表单静态数据
  const DataDialog_initialData: Category.Request.AddBody = {
    name: '',
    icon: null,
    description: '',
    status: 'PUBLIC',
    priority: 0,
  }
  // 操作标识（区分新增和编辑功能）
  const DataDialog_operationSign = ref<'add' | 'edit'>('add')
  // 操作id（用于编辑功能）
  const DataDialog_currentId = ref<number>()
  // ====导出的数据====
  // 弹窗控制器
  const DataDialog_showDialog = ref(false)
  // 弹窗标题
  const DataDialog_title = computed(() => {
    return DataDialog_operationSign.value === 'add' ? '新增分类' : '编辑分类'
  })
  // 弹窗表单数据
  const DataDialog_data: Ref<Category.Request.AddBody> = ref({
    ...DataDialog_initialData,
  })
  // 保存事件
  const DataDialog_handleSave = async (data: Category.Request.AddBody | Category.Request.UpdateBody) => {
    if (DataDialog_operationSign.value === 'add') {
      // 新增数据
      const res = await request.addService(data as Category.Request.AddBody)
      console.log(res)
    } else if (
      DataDialog_operationSign.value === 'edit' &&
      DataDialog_currentId.value
    ) {
      // 更新数据
      const res = await request.updateService(
        { id: DataDialog_currentId.value },
        data as Category.Request.UpdateBody,
      )
      console.log(res)
    }
    // 关闭弹窗
    DataDialog_showDialog.value = false
    // 刷新列表数据
    await DataTable_getData()
  }
  // </editor-fold>

  // <editor-fold> ==========统一导出==========
  return {
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
  }
  // </editor-fold>
}
