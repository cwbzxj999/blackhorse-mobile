import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import plugin from '@/utils/plugin'

// 导入移动端vue组件库
import Vant, { Lazyload } from 'vant'
// import 'vant/lib/index.css'
import 'vant/lib/index.less'

// 自己的样式
import '@/styles/index.less'

// 导入修改rem基准值的js插件  是在打包后使用
import 'amfe-flexible'

Vue.use(plugin)

Vue.use(Vant)

Vue.use(Lazyload)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
