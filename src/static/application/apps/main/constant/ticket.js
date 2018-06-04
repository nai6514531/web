import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 消费状态
  // 已退款
  CONSUME_STATUS_IS_REFUND: 4,
  // 发货失败
  CONSUME_STATUS_DELIVERY_FAILURE: 6,
  // 已发货
  CONSUME_STATUS_IS_DELIVERED: 7,

  // 饮水消费状态
  // 已结算
  DRINKING_CONSUME_STATUS_IS_SETTLED: 16,

  PAYMENT_TYPE_IS_IC: 4,
  
}, km({}))
