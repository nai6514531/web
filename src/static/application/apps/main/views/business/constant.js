import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({
  // 收款类型
  CASH_ACCOUNT_TYPE: {
    1: '支付宝',
    2: '微信',
    3: '银行卡',
  },

  // 账单类型
  BILL_STATUS: {
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

  // 服务类型
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

  // 收款类型
  // 支付宝
  CASH_ACCOUNT_TYPE_IS_ALIPAY: 1,
  // 微信
  CASH_ACCOUNT_TYPE_IS_WECHAT: 2,
  // 银行
  CASH_ACCOUNT_TYPE_IS_BANK: 3,

  // 账单状态
  // 未申请结算
  BILL_SETTLEMENT_STATUS_IS_DEFAULT: 0,
  // 等待结算
  BILL_SETTLEMENT_STATUS_IS_WAITING: 1,
  // 结算成功
  BILL_SETTLEMENT_STATUS_IS_SUCCESS: 2,
  // 结算中
  BILL_SETTLEMENT_STATUS_IS_PAYING: 3,
  // 结算失败
  BILL_SETTLEMENT_STATUS_IS_FAIL: 4,

  // 消费状态
  // 正常
  CONSUME_STATUS_IS_DEFAULT: 7,
  // 已退款
  CONSUME_STATUS_IS_REFUND: 4,
  
}, km({}))
