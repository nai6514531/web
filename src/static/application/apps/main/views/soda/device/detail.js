import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Row, Col, Card, message, Spin, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import styles from '../../../assets/css/page-detail.pcss'
import dict from '../../../utils/dict.js'

const confirm = Modal.confirm

class DeviceDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    const { keywords, deviceSerial } = search
    this.search = search
    this.breadItems = [
        {
          title: '苏打生活'
        },
        {
          title: '设备查询',
          url: `/soda/device?deviceSerial=${deviceSerial}&keywords=${keywords}`
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
      type: 'sodaDeviceDetail/detail',
      payload: {
        data:  {
            ...url,
            deviceSerial: this.props.match.params.id
        }
      }
    })
  }
  resetToken = () => {
    const { serialNumber } = this.props.sodaDeviceDetail.data
    const self = this
    confirm({
      title: '重置密码?',
      content: `设备号为${serialNumber}的密码将被重置,是否确认修改？`,
      onOk() {
        self.props.dispatch({
          type: 'sodaDeviceDetail/resetToken',
          payload: {
            data: { serialNumber }
          }
        })
      }
    })
  }
  render() {
    const { sodaDeviceDetail: { data, token }, loading } = this.props
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
                  <div><span className={styles.title}>模块号:</span>{data.serialNumber || '-'}</div>
                  <div>
                    <span className={styles.title}>价格:</span>
                    {`${data.firstPulseName}${data.firstPulsePrice / 100}
                    /${data.secondPulseName}${data.secondPulsePrice / 100}
                    /${data.thirdPulseName}${data.thirdPulsePrice / 100}
                    /${data.fourthPulseName}${data.fourthPulsePrice / 100}`}
                  </div>
                  <div><span className={styles.title}>类型:</span>{data.referenceDevice.name || '-'}</div>
                  <div><span className={styles.title}>楼层:</span>{data.address || '-'}</div>
                  <div><span className={styles.title}>状态:</span>{dict.deviceStatus[data.status.value] || '-' }</div>
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
                  <div><span className={styles.title}>商家名称:</span>{data.owner.name || '-'}</div>
                  <div><span className={styles.title}>商家ID:</span>{data.owner.id || '-'}</div>
                  <div><span className={styles.title}>登录账号:</span>{data.owner.account || '-'}</div>
                  <div><span className={styles.title}>注册时间:</span>{moment(data.owner.createdAt).format('YYYY-MM-DD HH:mm:ss') || '-'}</div>
                  <div><span className={styles.title}>联系人:</span>{data.owner.contact || '-'}</div>
                  <div><span className={styles.title}>手机号:</span>{data.owner.mobile || '-'}</div>
                  <div><span className={styles.title}>服务电话:</span>{data.owner.telephone || '-'}</div>
                  <div><span className={styles.title}>地址:</span><span className={styles.overText}>{data.owner.address || '-'}</span></div>
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>上级商家详情</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>商家名称:</span>{data.fromUser.name || '-'}</div>
                  <div><span className={styles.title}>商家ID:</span>{data.fromUser.id || '-'}</div>
                  <div><span className={styles.title}>登录账号:</span>{data.fromUser.account || '-'}</div>
                  <div><span className={styles.title}>注册时间:</span>{moment(data.fromUser.createdAt).format('YYYY-MM-DD HH:mm:ss') || '-'}</div>
                  <div><span className={styles.title}>联系人:</span>{data.fromUser.contact || '-'}</div>
                  <div><span className={styles.title}>手机号:</span>{data.fromUser.mobile || '-'}</div>
                  <div><span className={styles.title}>服务电话:</span>{data.fromUser.telephone || '-'}</div>
                  <div><span className={styles.title}>地址:</span><span className={styles.overText}>{data.fromUser.address || '-'}</span></div>
                </div>
              </div>
            </Card>
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
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(DeviceDetail)
