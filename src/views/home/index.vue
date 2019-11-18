<template>
  <div class="container">
    <!-- tab栏 swipeable开启滑动模式 -->
    <van-tabs :lazy-render="false" @change="changeChannel" swipeable v-model="activeIndex">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <!-- 滚动容器     //监听滚动 -->
        <div ref="scroll-wrapper" class="scroll-wrapper" @scroll="remember($event)">
          <van-pull-refresh
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list
              v-model="activeChannel.uploading"
              :finished="activeChannel.finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
              <!-- 注意外层容器 -->
                <van-cell v-for="item in activeChannel.articles" :key="item.art_id.toString()">
                  <div class="article_item">
                    <h3 class="van-ellipsis">{{item.title}}</h3>
                    <div class="img_box" v-if="item.cover.type === 3">
                      <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                      <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                      <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                    </div>
                    <div class="img_box" v-if="item.cover.type === 1">
                      <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                    </div>
                    <div class="info_box">
                      <span>{{item.aut_name}}</span>
                      <span>{{item.comm_count}}评论</span>
                      <span>{{item.pubdate|relTime}}</span>
                      <span v-if="user.token" class="close" @click="openMoreAction">
                        <van-icon name="cross"></van-icon>
                      </span>
                    </div>
                  </div>
                </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span class="bar_btn" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 使用组件：更多操作 -->
    <more-action v-if="user.token" v-model="showMoreAction"></more-action>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/MoreAction'
export default {
  name: 'home-index',
  components: { MoreAction },
  data () {
    return {
      // 是否上拉加载中
      // uploading: false,
      // 是否正在刷新中
      // downLoading: false,
      // 是否全部加载完成
      // finished: false,
      // 刷新完毕后提示文字（暂无更新|更新成功）
      refreshSuccessText: '',
      // 文章列表
      // articles: [],
      // 我的频道数据
      myChannels: [],
      // 当前激活的频道索引
      activeIndex: 0,
      // 显示更多操作
      showMoreAction: false
    }
  },
  computed: {
    // 当前激活的频道
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    ...mapState(['user'])
  },
  created () {
    // 在页面初始化时，获取频道数据
    this.getMyChannels()
  },
  // 激活组件钩子
  activated () {
    // 当前激活的频道的文章列表容器 scroll-wrapper 滚动之前记录的位置
    // scroll-wrapper 有几个频道就有几个容器 是一个数组
    if (this.$refs['scroll-wrapper']) {
      const dom = this.$refs['scroll-wrapper'][this.activeIndex]
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  watch: {
    user () {
      // 更新当前频道
      this.activeIndex = 0
      this.getMyChannels()
      this.onLoad()
    }
  },
  methods: {
    // 上拉加载的函数
    async onLoad () {
      // @load特点：默认在组件初始化会加载一次
      // @load特点：当加载的内容渲染后不足一屏，继续触发一次
      // @load事件触发事件：往上滑动到底部触发
      // 业务：获取列表数据进行渲染，现在是模拟
      // window.setTimeout(() => {
      //   // 数据加载成功
      //   // 1、结束加载中效果
      //   this.uploading = false
      //   // 2、模拟数据
      //   const data = []
      //   // 每加载一次，往后生成十条数据[1-10],[11-20]...
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     // 追加到模拟的data数据中
      //     data.push(i + 1)
      //   }
      //   // 再把data中数据追加到articles中
      //   this.articles.push(...data)
      //   // 3、判断数据是否全部加载完毕
      //   if (this.articles.length >= 50) {
      //     this.finished = true
      //   }
      //   console.log('ok')
      // }, 1000)
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 把获取的数据累加到当前频道下的文章列表中
      this.activeChannel.articles.push(...data.results)
      // 结束上拉加载效果
      this.activeChannel.uploading = false
      // 是否所有的数据已经加载完毕
      if (!data.pre_timestamp) {
        // 已经没有数据了
        this.activeChannel.finished = true
      } else {
        // 把后端返回的时间戳 记录下来 下次请求需要使用
        this.activeChannel.timestamp = data.pre_timestamp
      }
    },
    // 下拉刷新的函数
    async onRefresh () {
      // @refresh 在下拉的时候松手触发
      // window.setTimeout(() => {
      //   // 1、结束正在刷新的效果
      //   this.downLoading = false
      //   // 2、模拟数据
      //   const data = [1, 2, 3, 4]
      //   // 判断是否有数据
      //   if (data.length) {
      //     // 2.1、更新数据
      //     this.articles = data
      //     // 2.2给刷新后的提示
      //     this.refreshSuccessText = '更新成功'
      //     // 2.3若不满一屏
      //     this.onLoad()
      //     // 2.4重置是否已经加载全部数据
      //     this.finished = false
      //   } else {
      //     // 3、没有更新的数据时,刷新后的提示
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1000)
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 结束下拉刷新效果
      this.activeChannel.downLoading = false
      // 判断是否有数据
      if (data.results.length) {
        // 有数据
        this.activeChannel.articles = data.results
        // 加载有数据的提示信息
        this.refreshSuccessText = '更新成功'
        // 防止看到 没有更多信息了（重新刷新列表，下一页应该是有数据的）
        this.activeChannel.finished = false
        // 加上时间戳 加载下一页数据
        this.activeChannel.timestamp = data.pre_timestamp
        // 防止数据不够一屏，再来一次上拉加载数据 onLoad
        this.onLoad()
      } else {
        // 加载没有数据的提示
        this.refreshSuccessText = '暂无更新'
      }
    },
    // 获取频道数据的函数
    async getMyChannels () {
      const data = await getMyChannels()
      // 渲染频道 （tab组件）
      // this.myChannels = data.channels
      // myChannels每一项值应该都包含：频道id，频道名称，+文章列表+正在加载+正在刷新+是否全部加载+时间戳
      // this.myChannels = []
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            uploading: false, // 是否加载中
            downLoading: false, // 是否刷新中
            finished: false, // 是否还有数据
            timestamp: Date.now(), // 相当于分页页码
            scrollTop: 0
          }
        })
      })
    },
    // 切换频道tab组件
    changeChannel () {
      // 若当前频道无文章数据，那么自己来加载数据
      if (!this.activeChannel.articles.length) {
        // 显示加载中效果
        this.activeChannel.uploading = true
        this.onLoad()
      } else {
        this.$nextTick(() => {
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    // 记录阅读位置
    remember (e) {
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 打开更多操作对话框
    openMoreAction () {
      this.showMoreAction = true
    }
  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      // 保证scroll-wrapper容器能够生成滚动条，将来需要使用滚动
      overflow-y: auto;
    }
  }
}
//    /deep/作用：让样式在其他组件生效

.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
