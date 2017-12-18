import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import op from 'object-path'
import _ from 'lodash'
import { connect } from 'dva'
import { Button, Row, Col, Card, message, Spin, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import styles from '../../../assets/css/page-detail.pcss'
import dict from '../../../utils/dict.js'
import { conversionUnit } from '../../../utils/functions'

const confirm = Modal.confirm

class DeviceDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    const { keys, serials } = search
    this.search = search
    this.breadItems = [
        {
          title: '苏打生活'
        },
        {
          title: '设备查询',
          url: `/crm/device?serials=${serials}&keys=${keys}`
        },
        {
          title: '设备详情'
        }
      ]
  }
  componentDidMount() {
    const url = this.search
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'crmDeviceDetail/detail',
      payload: {
        data:  {
          ...url,
          id: this.props.match.params.id
        }
      }
    })
  }
  resetToken = () => {
    const { serial } = this.props.crmDeviceDetail.data
    const self = this
    confirm({
      title: '重置密码?',
      content: `设备号为${serial}的密码将被重置,是否确认修改？`,
      onOk() {
        self.props.dispatch({
          type: 'crmDeviceDetail/resetToken',
          payload: {
            data: { serial }
          }
        })
      }
    })
  }
  render() {
    const { crmDeviceDetail: { data, token }, loading } = this.props
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        {
          data ?
          <Spin
            tip='加载中...'
            spinning={loading}
            className={styles.wrap}>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>设备详情</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>模块号:</span>{data.serial || '-'}</div>
                  <div>
                    <span className={styles.title}>价格:</span>
                    {(data.modes || []).map((mode) => {
                      return [`${mode.name}`, `${conversionUnit(mode.value)}元`, `${mode.duration/1000}分钟`].join(' ')
                    }).join('/')}
                  </div>
                  <div><span className={styles.title}>类型:</span>{op(data).get('feature.name') || '-'}</div>
                  <div><span className={styles.title}>服务地点:</span>{_.without([op(data).get('serviceAddress.school.province.name'), op(data).get('serviceAddress.school.city.name'), op(data).get('serviceAddress.school.address')], '').join() || '-'}</div>
                  <div><span className={styles.title}>状态:</span>{op(data).get('status.description') || '-' }</div>
                  <div>
                    <span className={styles.title}>重置密码:</span>
                    {data.resettable === 1 ? '支持': '不支持' }
                    {data.resettable === 1 ?  <Button style={{ marginLeft: '20px',  marginRight: '20px' }} type='danger' size='small' onClick={this.resetToken}>重置</Button> : null }
                  </div>
                  {
                    token ? <div><span className={styles.title}>密码:</span>{token || '-'}</div> : null
                  }
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>商家详情</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>商家名称:</span>{op(data).get('user.name') || '-'}</div>
                  <div><span className={styles.title}>商家ID:</span>{op(data).get('user.id') || '-'}</div>
                  <div><span className={styles.title}>登录账号:</span>{op(data).get('user.account') || '-'}</div>
                  <div><span className={styles.title}>注册时间:</span>{op(data).get('user.createdAt') ? moment(op(data).get('user.createdAt')).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
                  <div><span className={styles.title}>联系人:</span>{op(data).get('user.contact') || '-'}</div>
                  <div><span className={styles.title}>手机号:</span>{op(data).get('user.mobile') || '-'}</div>
                  <div><span className={styles.title}>服务电话:</span>{op(data).get('user.telephone') || '-'}</div>
                  <div><span className={styles.title}>地点:</span><span className={styles.overText}>{op(data).get('user.address') || '-'}</span></div>
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>上级商家详情</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>商家名称:</span>{op(data).get('assignedUser.name') || '-'}</div>
                  <div><span className={styles.title}>商家ID:</span>{op(data).get('assignedUser.id') || '-'}</div>
                  <div><span className={styles.title}>登录账号:</span>{op(data).get('assignedUser.account') || '-'}</div>
                  <div><span className={styles.title}>注册时间:</span>{op(data).get('assignedUser.createdAt') ? moment(op(data).get('user.createdAt')).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
                  <div><span className={styles.title}>联系人:</span>{op(data).get('assignedUser.contact') || '-'}</div>
                  <div><span className={styles.title}>手机号:</span>{op(data).get('assignedUser.mobile') || '-'}</div>
                  <div><span className={styles.title}>服务电话:</span>{op(data).get('assignedUser.telephone') || '-'}</div>
                  <div><span className={styles.title}>地点:</span><span className={styles.overText}>{op(data).get('assignedUser.address') || '-'}</span></div>
                </div>
              </div>
            </Card>
          </Spin> : null
        }
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmDeviceDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmDeviceDetail: state.crmDeviceDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(DeviceDetail)
