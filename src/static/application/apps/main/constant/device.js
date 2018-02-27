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
  
}, km({}))
