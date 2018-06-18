import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import op from 'object-path'
import _ from 'lodash'
import cx from 'classnames'
import { connect } from 'dva'
import { Button, Row, Col, Card, message, Spin, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import dict from '../../../utils/dict.js'
import { conversionUnit } from '../../../utils/functions'
import DEVICE from '../../../constant/device'

import styles from './index.pcss'
import pageStyles from '../../../assets/css/page-detail.pcss'

const confirm = Modal.confirm

class DeviceDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    const { keys, serials } = search
    this.search = search
    this.breadItems = [
      {
        title: '设备查询',
        url: `/PATHNAME/device?serials=${serials}&keys=${keys}&offset=0&limit=10`
      },
      {
        title: '设备详情'
      }
    ],
    this.businessBreadItems = [
      {
        title: '设备管理',
        url: `/PATHNAME/business/device${location.search}`
      },
      {
        title: '设备详情'
      }
    ]
  }
  componentDidMount() {
    const { location: { pathname } } = this.props
    const url = this.search
    if (!!~pathname.indexOf('business/device')) {
      this.isFromBusiness = true
    }
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'sodaDeviceDetail/detailWithUser',
      payload: {
        data:  {
          ...url,
          serial: this.props.match.params.serial
        }
      }
    })
    this.props.dispatch({
      type: 'sodaDeviceDetail/modes',
      payload: {
        data:  {
          serials: this.props.match.params.serial
        }
      }
    })
    this.props.dispatch({
      type: 'sodaDeviceDetail/deviceTypes'
    })
  }
  resetToken = () => {
    const { serial } = this.props.sodaDeviceDetail.data
    const self = this
    confirm({
      title: '重置验证码',
      content: `获取重置验证码后，如未将此验证码输入设备验证，将造成设备无法使用。是否确认获取？`,
      iconType: 'exclamation-circle',
      className: `${styles.confirmModal}`,
      onOk() {
        self.props.dispatch({
          type: 'sodaDeviceDetail/resetToken',
          payload: {
            data: { serial }
          }
        })
      }
    })
  }
  render() {
    const { sodaDeviceDetail: { data, token }, deviceTypes, modes, loading } = this.props
    const featureId = op(data).get('feature.id')
    const feature = _.find(deviceTypes || [], { id : featureId }) || {}
    const reference = _.find(feature.references || [], { id : op(data).get('feature.reference.id') }) || {}
    let isDrinkingWater = featureId === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER
    const suffix = isDrinkingWater ? '元/L' : '元'

    return(
      <div>
        <Breadcrumb items={this.isFromBusiness ? this.businessBreadItems : this.breadItems} />
        {
          data ?
          <Spin
            tip='加载中...'
            spinning={loading}
            className={pageStyles.wrap}>
            <Card className={pageStyles.card}>
              <div className={pageStyles.header}>
                  <h1>设备详情</h1>
              </div>
              <div className={pageStyles['sub-card']}>
                <div className={pageStyles['card-item']}>
                  <div><span className={pageStyles.title}>设备编号：</span>{data.serial || '-'}</div>
                  <div><span className={pageStyles.title}>关联设备：</span>{op(reference).get('name') || '-'}</div>
                  <div>
                    <span className={pageStyles.title}>服务单价：</span>
                    {(modes || []).map((mode) => {
                      return [`${conversionUnit(mode.value)}${suffix}`, `${mode.name}`].join(' ')
                    }).join('，')}
                  </div>
                  <div>
                    <span className={pageStyles.title}>服务地点：</span>
                    { _.isEmpty(op(data).get('serviceAddress')) ? '-' :
                      _.without([op(data).get('serviceAddress.school.province.name'), op(data).get('serviceAddress.school.city.name'), op(data).get('serviceAddress.school.name'), op(data).get('serviceAddress.school.address')], '').join(' / ') || '-'
                    }
                  </div>
                  {
                    featureId === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER ? <div>
                      <span className={pageStyles.title}>在线状态：</span>
                      <span className={op(data).get('onlineStatus.value') == 1 ? styles.online : styles.offline}>{op(data).get('onlineStatus.description') || '-' }</span>
                    </div> : null
                  }
                  <div>
                    <span className={pageStyles.title}>状态：</span><span className={styles.title}>{op(data).get('status.description') || '-' }</span>
                  </div>
                  {
                    featureId === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER && false ? <div>
                    <span className={pageStyles.title}>制热状态：</span>
                    <span className={styles.title}>{op(data).get('config.status') ? '已开启' : '已关闭' }</span>
                    </div> : null
                  }
                  {
                    featureId !== DEVICE.FEATURE_TYPE_IS_DRINKING_WATER ? <div>
                      <span className={pageStyles.title}>重置验证码：</span>
                      {op(data).get('limit.password.isResettable') ? '支持': '不支持' }
                      {op(data).get('limit.password.isResettable') ? <Button style={{ marginLeft: '20px',  marginRight: '20px' }} type='danger' size='small' onClick={this.resetToken}>获取</Button> : null }
                    </div> : null
                  }
                  {
                    token ? <div><span className={pageStyles.title}>验证码：</span>{token || '-'}</div> : null
                  }
                </div>
              </div>
            </Card>
            {
              !this.isFromBusiness || isDrinkingWater ? <Card className={pageStyles.card}>
                <div className={pageStyles.header}>
                    <h1>运营商详情</h1>
                </div>
                <div className={pageStyles['sub-card']}>
                  <div className={pageStyles['card-item']}>
                    <div><span className={pageStyles.title}>商家名称：</span>{op(data).get('user.name') || '-'}</div>
                    <div><span className={pageStyles.title}>商家ID：</span>{op(data).get('user.id') || '-'}</div>
                    <div><span className={pageStyles.title}>登录账号：</span>{op(data).get('user.account') || '-'}</div>
                    <div><span className={pageStyles.title}>注册时间：</span>{op(data).get('user.createdAt') ? moment(op(data).get('user.createdAt')).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
                    <div><span className={pageStyles.title}>联系人：</span>{op(data).get('user.contact') || '-'}</div>
                    <div><span className={pageStyles.title}>手机号：</span>{op(data).get('user.mobile') || '-'}</div>
                    <div><span className={pageStyles.title}>服务电话：</span>{op(data).get('user.telephone') || '-'}</div>
                    <div><span className={pageStyles.title}>地点：</span><span className={pageStyles.overText}>{op(data).get('user.address') || '-'}</span></div>
                  </div>
                </div>
              </Card> : null
            }
            {
              !this.isFromBusiness ? <Card className={pageStyles.card}>
                <div className={pageStyles.header}>
                    <h1>上级运营商详情</h1>
                </div>
                <div className={pageStyles['sub-card']}>
                  <div className={pageStyles['card-item']}>
                    <div><span className={pageStyles.title}>商家名称：</span>{op(data).get('assignedUser.name') || '-'}</div>
                    <div><span className={pageStyles.title}>商家ID：</span>{op(data).get('assignedUser.id') || '-'}</div>
                    <div><span className={pageStyles.title}>登录账号：</span>{op(data).get('assignedUser.account') || '-'}</div>
                    <div><span className={pageStyles.title}>注册时间：</span>{moment(op(data).get('assignedUser.createdAt')).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div><span className={pageStyles.title}>联系人：</span>{op(data).get('assignedUser.contact') || '-'}</div>
                    <div><span className={pageStyles.title}>手机号：</span>{op(data).get('assignedUser.mobile') || '-'}</div>
                    <div><span className={pageStyles.title}>服务电话：</span>{op(data).get('assignedUser.telephone') || '-'}</div>
                    <div><span className={pageStyles.title}>地点：</span><span className={pageStyles.overText}>{op(data).get('assignedUser.address') || '-'}</span></div>
                  </div>
                </div>
              </Card> : null
            }
          </Spin> : null
        }
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'sodaDeviceDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    sodaDeviceDetail: state.sodaDeviceDetail,
    deviceTypes: state.sodaDeviceDetail.deviceTypes,
    modes: state.sodaDeviceDetail.modes,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(DeviceDetail)
