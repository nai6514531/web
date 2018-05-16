import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 消费状态
  // 已退款
  CONSUME_STATUS_IS_REFUND: 4,
  // 正常
  CONSUME_STATUS_DELIVERY_FAILURE: 6,
  // 正常
  CONSUME_STATUS_IS_DEFAULT: 7,


  PAYMENT_TYPE_IS_IC: 4,
  
}, km({}))
