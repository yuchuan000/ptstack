import { ref } from 'vue'

export const deleteButton = ref(true)

export const restoreButton = ref(true)

export const addClick = () => {
  console.log('点击了新建按钮')
}

export const deleteClick = () => {
  console.log('点击了删除按钮')
}

export const restoreClick = () => {
  console.log('点击了恢复按钮')
}
