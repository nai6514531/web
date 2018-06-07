import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 消费状态
  // 已退款
  STATUS_IS_REFUND: 4,
  // 发货失败
  STATUS_DELIVERY_FAILURE: 6,
  // 已发货
  STATUS_IS_DELIVERED: 7,

  // 饮水消费状态
  // 已结算
  DRINKING_STATUS_IS_SETTLED: 16,

  PAYMENT_TYPE_IS_IC: 4,

  // 支付类型
  PAYMENT_TYPE: {
    1: '微信',
    2: '支付宝',
    3: '账户余额',
    4: 'IC卡余额',
    7: '鼓励金',
  },
  
}, km({}))
