<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
///////////////////////组件接收参数与事件定义/////////////////////////////
interface FormData {
  name: string
  icon?: string | null
  description?: string | null
  status?: number
  sort?: number
}
const props = defineProps<{
  dialogVisible: boolean
  title: string
  formData?: FormData
  action?: string
  method?: string
}>()
const emits = defineEmits(['save', 'update:dialogVisible'])
// 干净数据
const initialValues: FormData = {
  name: '',
  icon: '',
  description: '',
  status: 1,
  sort: 0,
}
/////////////////////////数据内部化处理///////////////////////////////
// 内部表单
const formDataInner = ref({ ...initialValues })
// 监听表单数据（用于判断回显数据还是新建）
watch(
  () => props.formData,
  (newValue) => {
    // 拷贝赋值，如果直接=newValue，会影响父组件的临时数据
    formDataInner.value = newValue ? { ...newValue } : { ...initialValues }
  },
  {
    immediate: true, // 第一次传数据就执行
    deep: true,
  },
)
// 弹窗关闭处理
const cancel = () => {
  emits('update:dialogVisible', false)
}
// 弹窗保存处理
const save = () => {
  emits('save', { ...formDataInner.value })
  formDataInner.value = { ...initialValues }
}
/////////////////////////上传图片处理///////////////////////////////
import type { UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
// 上传之前钩子（用于检测文件属性）
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  console.log(rawFile)
  const allowFileTypes = ['image/jpeg', 'image/png']
  if (!allowFileTypes.includes(rawFile.type)) {
    ElMessage.error('必须是 png 或 jpeg 格式！')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('大小不能超过 2MB!')
    return false
  }
  return true
}
// 上传成功钩子
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile,
) => {
  formDataInner.value.icon = URL.createObjectURL(uploadFile.raw!)
}
/////////////////////////状态选择列表///////////////////////////////
const statusOptions = [
  {
    value: 0,
    label: '私密',
  },
  {
    value: 1,
    label: '正常',
  },
]
</script>

<template>
  <el-dialog
    :model-value="props.dialogVisible"
    @update:model-value="cancel"
    :show-close="false"
    :title="title"
    width="500"
  >
    <el-form>
      <!--  名称    -->
      <el-form-item label="分类名称">
        <el-input v-model="formDataInner.name"></el-input>
      </el-form-item>
      <!--    图标    -->
      <el-form-item label="图标">
        <el-upload
          class="avatar-uploader"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-image
            alt="图标"
            style="width: 5rem; height: 5rem"
            v-if="formDataInner.icon"
            :src="formDataInner.icon"
            fit="cover"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <!--  描述    -->
      <el-form-item label="描述">
        <el-input
          autosize
          type="textarea"
          maxlength="100"
          show-word-limit
          v-model="formDataInner.description"
        ></el-input>
      </el-form-item>
      <!--  状态    -->
      <el-form-item label="状态">
        <el-select
          v-model="formDataInner.status"
          placeholder="请选择状态"
          style="width: 240px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!--  优先级    -->
      <el-form-item label="优先级">
        <el-input-number v-model="formDataInner.sort" :min="0" :max="99" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="save"> 保存 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
// 上传组件样式
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
