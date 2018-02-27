import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({
  // 账单类型
  STATUS: {
    0: '未申请结算', 
    1: '等待结算', 
    2: '结算成功',
    3: '结算中', 
    4: '结算失败',
  }, 

  // 支付类型
  PAYMENT_TYPE: {
    1: '微信',
    2: '支付宝',
    3: '账户余额',
    4: 'IC卡余额',
  },

  CONSUME_STATUS: { 
    4: '已退款',
    7: '正常',
  },

  // 账单状态
  // 未申请结算
  SETTLEMENT_STATUS_IS_DEFAULT: 0,
  // 等待结算
  SETTLEMENT_STATUS_IS_WAITING: 1,
  // 结算成功
  SETTLEMENT_STATUS_IS_SUCCESS: 2,
  // 结算中
  SETTLEMENT_STATUS_IS_PAYING: 3,
  // 结算失败
  SETTLEMENT_STATUS_IS_FAIL: 4,

  // 消费状态
  // 正常
  CONSUME_STATUS_IS_DEFAULT: 7,
  // 已退款
  CONSUME_STATUS_IS_REFUND: 4,

  
}, km({}))
