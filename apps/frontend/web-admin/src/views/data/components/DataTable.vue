<script setup lang="ts" generic="T">
// 列配置
interface TableColumns {
  prop: string
  label: string
  isImage?: boolean
  buttons?: Array<{
    label: string
    show: boolean
  }>
}

// 表格配置
interface TableConfig<T> {
  tableColumns: TableColumns[]
  tableData: Array<T>
}

// 接收参数
const props = defineProps<{
  tableConfig: TableConfig<T>
}>()

// 响应事件
defineEmits(['buttonClick'])
// const selectable = (row) => {
//   console.log(row)
//   return ![1, 2].includes(row.id)
// }
</script>

<template>
  <el-table
    :data="props.tableConfig.tableData"
    style="width: 100%"
    height="100%"
  >
    <!--    <el-table-column type="selection" :selectable="selectable" width="55" />-->
    <el-table-column
      v-for="item in props.tableConfig.tableColumns"
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
        />
        <el-button-group v-if="item.buttons">
          <span v-for="button in item.buttons">
            <el-button
              text
              size="small"
              v-if="button.show"
              :key="button.label"
              @click="
                $emit('buttonClick', {
                  column: scope.column.rawColumnKey,
                  button: button.label,
                })
              "
              >{{ button.label }}</el-button
            >
          </span>
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
