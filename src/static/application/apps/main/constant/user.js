import km from 'keymirror'
import _ from 'underscore'

module.exports = _.extend({

  // 系统管理员ID
  ID_IS_ROOT_ADMIN: 1,

  // 用户类型
  TYPE_IS_DEFAULT: 0,
  TYPE_IS_EMPLOYEE: 1 // 员工
 
  
}, km({}))
