// vuex状态管理token

import Vue from 'vue'
import Vuex from 'vuex'

import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息()
    user: auth.getUser()
  },
  mutations: {
    // 设置存储用户信息
    setUser (state, user) {
      // 更新state的状态
      state.user = user
      // 更新本地存储
      auth.setUser(user)
    },
    // 清除用户信息
    delUser (state) {
      // 更新state状态
      state.user = {}
      // 更新本地存储
      auth.delUser()
    }
  },
  actions: {
  },
  modules: {
  }
})
