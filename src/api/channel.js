// 导出 频道相关的API函数
import request from '@/utils/request'

/**
 * 获取我的频道（因为未登录，获取的系统默认给的频道）
 */
export const getMyChannels = () => {
  return request('/app/v1_0/user/channels', 'get')
}
