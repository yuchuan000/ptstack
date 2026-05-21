import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('LayoutStore', () => {
  // 菜单栏是否折叠标志： 默认:否
  const isCollapse = ref(false)

  // 修改展开标识函数
  const changeCollapse = () => {
    isCollapse.value = !isCollapse.value
  }

  return {
    isCollapse,
    changeCollapse,
  }
})
