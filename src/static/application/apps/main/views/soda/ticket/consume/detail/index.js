import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Row, Col, Spin, Card, Button, Modal } from 'antd'
import moment from 'moment'
import op from 'object-path'
import _ from 'lodash'

import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import dict from '../../../../../utils/dict.js'
import { conversionUnit } from '../../../../../utils/functions.js'
import { transformUrl, toQueryString } from '../../../../../utils/'
import DEVICE from '../../../../../constant/device'
import AUTH_HOLD from '../../../../../constant/auth-hold'
import TICKET from '../../../../../constant/ticket'

import pageStyles from '../../../../../assets/css/page-detail.pcss'
import styles from './index.pcss'

const confirm = Modal.confirm

class CrmConsumeDetail extends Component {
  constructor(props) {
    super(props)
    this.ticketId = this.props.match.params.id
    this.breadItems = [
      {
        title: '消费查询',
        url: `/PATHNAME/consume`
      },
      {
        title: '消费详情'
      }
    ]
  }
  componentDidMount() {
    const id = this.props.match.params.id
    const { location: { pathname } } = this.props
    this.props.dispatch({
      type: 'consumeDetail/detail',
      payload: {
        id: this.ticketId,
        type: !!~pathname.indexOf('soda-drinking') ? DEVICE.FEATURE_TYPE_IS_DRINKING_WATER : 0
      }
    })
  }
  releaseStauts = () => {
    const { consumeDetail: { data }  } = this.props
    const self = this
    confirm({
      content: `确定恢复该用户的账户余额？`,
      iconType: 'exclamation-circle',
      className: `${styles.confirmModal}`,
      onOk() {
        self.props.dispatch({
          type: 'consumeDetail/releaseStatus',
          payload: {
            data: {
              holdId: data.holdId,
            }
          }
        })
      }
    })
  }
  render() {
    const { consumeDetail: { data, parent, authHold }, loading  } = this.props
    let isDrinkingWater = data.feature === DEVICE.FEATURE_IS_DRINKING_WATER

    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        <Card className={pageStyles.card}>
          <div className={pageStyles.header}>
              <h1>消费信息</h1>
          </div>
          <div className={pageStyles['sub-card']}>
            <div className={pageStyles['card-item']}>
              <div><span className={pageStyles.title}>订单编号：</span>{data.ticketId}</div>
              <div><span className={pageStyles.title}>下单时间：</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
               <div>
                <span className={pageStyles.title}>订单状态：</span>
                  { 
                    authHold.status === AUTH_HOLD.STATUS_IS_USING && op(data).get('status.value') !== TICKET.DRINKING_CONSUME_STATUS_IS_SETTLED ? <div className={styles.release}>
                      <span>余额被冻结</span>
                      <Button
                        type='primary'
                        style={{ marginLeft: 10, marginTop: 10 }}
                        onClick={this.releaseStauts}>
                        取消冻结
                      </Button>
                    </div> : op(data).get('status.description') 
                  }
              </div> 
              <div><span className={pageStyles.title}>设备编号：</span>{data.serial}</div>
              <div><span className={pageStyles.title}>服务地点：</span> 
                { _.isEmpty(op(data).get('device.serviceAddress')) ? '-' :
                  _.without([op(data).get('device.serviceAddress.school.province.name'), op(data).get('device.serviceAddress.school.city.name'), op(data).get('device.serviceAddress.school.name'), op(data).get('device.serviceAddress.school.address')], '').join(' / ') || '-'
                }
              </div>
              <div><span className={pageStyles.title}>消费手机号：</span>{data.mobile}</div>
              { !isDrinkingWater ? <div><span className={pageStyles.title}>消费密码：</span>{data.token}</div> : null }
              { !isDrinkingWater ? <div><span className={pageStyles.title}>支付方式：</span>{data.payment.name}</div> : null }
              { 
                isDrinkingWater ? <div><span className={pageStyles.title}>服务单价：</span>
                  {
                    (op(data).get('snapshot.modes') || []).map((mode) => {
                    return mode.value + '元/L ' + mode.name
                  }).join('，')
                  }
                </div> : null 
              }
              { 
                isDrinkingWater ? <div><span className={pageStyles.title}>本次使用：</span>
                  {(op(data).get('snapshot.modes') || []).map((mode) => {
                    if (mode.preset === 'DRINKING_HOT') {
                      return (data.hot.amount / 1000) + 'L ' + conversionUnit(data.hot.value) + '元 ' + mode.name 
                    }
                    if (mode.preset === 'DRINKING_COLD') {
                      return (data.cold.amount / 1000) + 'L '+ conversionUnit(data.cold.value) + '元 ' + mode.name 
                    }
                  }).join('，')}
                </div> : null 
              }
              { !isDrinkingWater ? <div><span className={pageStyles.title}>服务名：</span>{op(data).get('snapshot.modes.0.name')}</div> : null }
              <div><span className={pageStyles.title}>消费金额：</span>{conversionUnit(data.value) + '元'}</div>
            </div>
          </div>
        </Card>
        <Card className={pageStyles.card}>
          <div className={pageStyles.header}>
              <h1>运营商信息</h1>
          </div>
          <div className={pageStyles['sub-card']}>
            <div className={pageStyles['card-item']}>
              <div><span className={pageStyles.title}>名称：:</span>{data.owner.name || '-' }</div>
              <div><span className={pageStyles.title}>服务电话：</span>{data.owner.telephone || '-' }</div>
              <div><span className={pageStyles.title}>手机号：</span>{data.owner.mobile || '-' }</div>
              <div><span className={pageStyles.title}>地址：</span>{data.owner.address || '-' }</div>
            </div>
          </div>
        </Card>
        { 
          !isDrinkingWater ? <Card className={pageStyles.card}>
            <div className={pageStyles.header}>
              <h1>上级运营商信息</h1>
            </div>
            <div className={pageStyles['sub-card']}>
              <div className={pageStyles['card-item']}>
                <div><span className={pageStyles.title}>名称：</span>{parent.name || '-' }</div>
                <div><span className={pageStyles.title}>服务电话：</span>{parent.telephone || '-' }</div>
                <div><span className={pageStyles.title}>手机号：</span>{parent.mobile || '-' }</div>
                <div><span className={pageStyles.title}>地址：</span>{parent.address || '-' }</div>
              </div>
            </div>
          </Card> : null
        }
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'consumeDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    consumeDetail: state.consumeDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(CrmConsumeDetail)
