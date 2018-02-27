import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 收款类型
  TYPE: {
    1: '支付宝',
    2: '微信',
    3: '银行卡',
  },

  // 收款类型
  // 支付宝
  TYPE_IS_ALIPAY: 1,
  // 微信
  TYPE_IS_WECHAT: 2,
  // 银行
  TYPE_IS_BANK: 3,
  
}, km({}))
