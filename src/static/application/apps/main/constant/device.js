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

  // 设备类型
  // 密码模块
  FEATURE_TYPE_IS_PASSWORD: 1,
  // 充电桩
  FEATURE_TYPE_IS_CHARGING: 2,
  // GPRS模块
  FEATURE_TYPE_IS_GPRS: 3,
  // 饮水机通信板
  FEATURE_TYPE_IS_DRINKING_WATER: 4,

  FEATURE: {
    1: '洗衣',
    2: '充电',
    4: '饮水',
  }

  
}, km({}))
