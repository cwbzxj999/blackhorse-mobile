module.exports = {
  plugins: {
    autoprefixer: {},
    // 将单位转化为rem
    'postcss-pxtorem': {
      // 基准值  iPhone6的尺寸：375px
      rootValue: 37.5,
      propList: ['*']
    }
  }
}
