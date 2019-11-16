<template>
  <div class="container">
    <van-nav-bar left-arrow @click-left="$router.back()" title="登录"></van-nav-bar>
    <van-cell-group>
        <van-field @blur="checkMobile" :error-message="errorMsg.mobile" v-model.trim="loginForm.mobile" label="手机号" placeholder="请输入手机号" />
        <van-field @blur="checkCode" :error-message="errorMsg.code" v-model="loginForm.code" label="验证码" placeholder="请输入验证码">
          <van-button class="p5" slot="button" size="mini" type="primary">发送验证码</van-button>
        </van-field>
      </van-cell-group>
      <div class="btn_box">
        <van-button type="info" @click="login" block round>登 录</van-button>
      </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { mapMutations } from 'vuex'
export default {
  name: 'login',
  // 当失去焦点后，获取输入框的值，进行校验，失败的话给输入框绑定error-message属性赋值，成功清除值
  // 对应整体表单进行校验，获取每一项表单元素的值进行校验，同上
  data () {
    return {
      // 表单数据
      loginForm: {
        mobile: '',
        code: ''
      },
      // 错误提示
      errorMsg: {
        mobile: '',
        code: ''
      }
    }
  },
  methods: {
    checkMobile () {
      // 1.非空
      if (!this.loginForm.mobile) {
        this.errorMsg.mobile = '请输入手机号'
        return false
      }
      // 2、格式
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.mobile)) {
        this.errorMsg.mobile = '手机号格式错误'
        return false
      }
      // 3.成功
      this.errorMsg.mobile = ''
    },
    checkCode () {
      // 1、非空
      if (!this.loginForm.code) {
        this.errorMsg.code = '请输入验证码'
        return false
      }
      // 2、格式
      if (!/^\d{6}$/.test(this.loginForm.code)) {
        this.errorMsg.code = '验证码格式错误'
        return false
      }
      // 3、成功
      this.errorMsg.code = ''
    },
    async login () {
      // 对整体表单进行校验
      this.checkMobile()
      this.checkCode()
      // 判断errorMsg 对象中是否有错误信息  校验失败
      if (this.errorMsg.mobile || this.errorMsg.code) {
        return false
      }
      // 如果校验成功就进行登录
      try {
        // 基于request.js在api目录下封装一个调用接口的函数，当组件导入该函数使用即可
        const data = await login(this.loginForm)
        // 登录成功
        // 1、更新vuex和本地存储 用户信息
        this.setUser(data)
        // 2、跳转（如果地址栏有回跳地址就回跳，如果没有就跳转到个人中心）
        const { redirectUrl } = this.$route.query
        // || && 短路或 短路与
        this.$router.push(redirectUrl || '/user')
      } catch (e) {
        // 登录失败
        this.$toast.fail('手机号或验证码错误')
      }
    },
    ...mapMutations(['setUser'])
  }
}
</script>

<style scoped lang='less'>
.p5{
  padding: 0 5px;
}
.btn_box{
  padding: 10px;
  .van-button{
    height: 32px;
    line-height: 32px;
  }
}
</style>
