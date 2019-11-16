// 提供 调用文章相关的接口函数
import request from '@/utils/request'

export const getArticles = (channelId, timestamp) => {
  return request('/app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}
