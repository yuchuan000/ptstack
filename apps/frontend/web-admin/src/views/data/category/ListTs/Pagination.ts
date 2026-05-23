import { ref, watch } from 'vue'

export const currentPage = ref(1)
export const pageSize = ref(10)
export const total = ref(100)

watch(currentPage, (val) => {
  console.log(val)
})
