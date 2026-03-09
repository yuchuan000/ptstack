<script setup>
/**
 * 图片上传组件
 * 提供图片上传、预览和删除功能
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, Loading, Delete } from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/url' // 工具函数，用于获取完整的图片URL

/**
 * 组件属性
 */
const props = defineProps({
  /**
   * 图片URL，支持v-model双向绑定
   * @type {string}
   * @default ''
   */
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * 上传函数，用于处理图片上传
   * @type {Function}
   * @param {File} file - 要上传的文件
   * @returns {Promise<{url: string}>} 返回包含图片URL的对象
   * @required
   */
  uploadFunction: {
    type: Function,
    required: true,
  },
  /**
   * 上传提示文本
   * @type {string}
   * @default '点击上传图片'
   */
  placeholder: {
    type: String,
    default: '点击上传图片',
  },
  /**
   * 预览宽度
   * @type {string}
   * @default '120px'
   */
  previewWidth: {
    type: String,
    default: '120px',
  },
  /**
   * 预览高度
   * @type {string}
   * @default '120px'
   */
  previewHeight: {
    type: String,
    default: '120px',
  },
  /**
   * 是否显示为圆形
   * @type {boolean}
   * @default false
   */
  isCircle: {
    type: Boolean,
    default: false,
  },
})

/**
 * 组件事件
 */
const emit = defineEmits([
  'update:modelValue', // 双向更新事件
])

/**
 * 上传状态
 * @type {boolean}
 */
const uploading = ref(false)

/**
 * 处理图片上传
 * @param {object} file - 上传的文件对象
 */
const handleUpload = async (file) => {
  if (!file.raw) return

  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return
  }

  // 验证文件大小（限制为2MB）
  const isLt2M = file.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  try {
    uploading.value = true
    const response = await props.uploadFunction(file.raw)
    emit('update:modelValue', response.url)
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

/**
 * 处理图片删除
 */
const handleRemove = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-uploader-wrapper">
    <div
      class="image-preview"
      v-if="modelValue"
      :style="{
        width: previewWidth,
        height: previewHeight,
        borderRadius: isCircle ? '50%' : '8px',
      }"
    >
      <img :src="getFullUrl(modelValue)" alt="图片预览" />
      <div class="image-actions">
        <el-button type="danger" size="small" @click="handleRemove">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <el-upload
      v-else
      class="image-uploader"
      :show-file-list="false"
      :auto-upload="false"
      accept="image/*"
      @change="handleUpload"
    >
      <div
        class="upload-placeholder"
        :style="{
          width: previewWidth,
          height: previewHeight,
          borderRadius: isCircle ? '50%' : '8px',
        }"
      >
        <el-icon :size="24"><Camera /></el-icon>
        <span>{{ placeholder }}</span>
      </div>
    </el-upload>
    <div v-if="uploading" class="upload-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>上传中...</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-uploader-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  position: relative;
  overflow: hidden;
  border: 2px solid #e5e6eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-actions {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .image-actions {
    opacity: 1;
  }
}

.image-uploader {
  :deep(.el-upload) {
    border: 2px dashed #d9d9d9;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: #165dff;
    }
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 14px;
  gap: 8px;
}

.upload-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #165dff;
  font-size: 14px;
}
</style>
