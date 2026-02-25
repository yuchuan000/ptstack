import request from '@/utils/request'

export const generateSummary = (data) => {
  return request({
    url: '/ai/generate-summary',
    method: 'post',
    data
  })
}
