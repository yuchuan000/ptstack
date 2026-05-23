import { ref } from 'vue'

const options = [
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  },
  {
    value: 'Option3',
    label: 'Option3',
  },
  {
    value: 'Option4',
    label: 'Option4',
  },
  {
    value: 'Option5',
    label: 'Option5',
  },
]

export const searchFormArray = ref([
  {
    type: 'select',
    label: '状态：',
    params: {
      placeholder: '请选择别称',
      options: [...options],
    },
    data: '',
  },
  {
    label: '软删除：',
    type: 'checkbox',
    params: {
      label: '是',
    },
    data: false,
  },
])

export const queryClick = () => {
  console.log('点击了查询按钮')
}

export const resetClick = () => {
  console.log('点击了重置按钮')
}
