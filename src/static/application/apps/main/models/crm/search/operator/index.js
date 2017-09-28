import { message } from 'antd'
import deviceService from '../../../../services/crm/device.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  }
}
export default {
  namespace: 'crmOperator',
  state: cloneDeep(model),
}
