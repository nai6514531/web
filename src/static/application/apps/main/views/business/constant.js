import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({
  CASH_ACCOUNT_TYPE: {
    1: '支付宝',
    2: '微信',
    3: '银行卡',
  },

  BILL_STATUS: {
    0: '未申请结算', 
    1: '等待结算', 
    2: '结算成功',
    3: '结算中', 
    4: '结算失败',
  }, 

  PAYMENT_TYPE: {
    1: '微信',
    2: '支付宝',
    3: '账户余额',
    4: 'IC卡余额',
  },

  SERVICE_TYPE: {
    1: '单脱',
    2: '快洗',
    3: '标准',
    4: '大物洗',
  },

  DEVICE_STATUS: {
    0: '空闲',
    9: '锁定',
    601: '使用中',
    602: '使用中',
    603: '使用中',
    604: '使用中',
  },

  FEATURE_TYPE: {
    1: '洗衣机',
    2: '充电桩',
  },

  CASH_ACCOUNT_TYPE_IS_ALIPAY: 1,
  CASH_ACCOUNT_TYPE_IS_WECHAT: 2,
  CASH_ACCOUNT_TYPE_IS_BANK: 3,

  BILL_SETTLEMENT_STATUS_IS_DEFAULT: 0,
  BILL_SETTLEMENT_STATUS_IS_WAITING: 1,
  BILL_SETTLEMENT_STATUS_IS_SUCCESS: 2,
  BILL_SETTLEMENT_STATUS_IS_PAYING: 3,
  BILL_SETTLEMENT_STATUS_IS_FAIL: 4,

  CONSUME_STATUS_IS_DEFAULT: 7,
  CONSUME_STATUS_IS_REFUND: 4,

  DEVICE_STATUS_IS_FREE: 0,
  DEVICE_STATUS_IS_LOCK: 9,
  DEVICE_STATUS_IS_USING: [601, 602, 603, 604],
  
}, km({}))
