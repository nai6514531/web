import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 设备状态
  // 空闲
  STATUS_IS_FREE: [0, 2],
  // 锁定
  STATUS_IS_LOCK: [9],
  // 使用中
  STATUS_IS_USING: [601, 602, 603, 604, 605, 606, 607, 608],

  // 设备模式状态
  // 空闲
  MODE_STATUS_IS_FREE: 0,
  // 锁定
  MODE_STATUS_IS_LOCK: 9,

  // 服务类型
  SERVICE_TYPE: {
    1: '单脱',
    2: '快洗',
    3: '标准',
    4: '大物洗',
  },

  // 设备类型
  // 密码模块
  FEATURE_TYPE_IS_PASSWORD: 1,
  // 充电桩
  FEATURE_TYPE_IS_CHARGING: 2,
  // GPRS模块
  FEATURE_TYPE_IS_GPRS: 3,
  // 饮水机通信板
  FEATURE_TYPE_IS_DRINKING_WATER: 4,
  
  // 消费订单
  // 洗衣
  FEATURE_IS_LAUNDRY: 1,
  // 充电
  FEATURE_IS_CHARGING: 2,
  // 饮水
  FEATURE_IS_DRINKING_WATER: 3,

  FEATURE: {
    1: '洗衣',
    2: '充电',
    3: '饮水',
  }

  
}, km({}))
