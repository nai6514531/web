import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Row, Col, Spin, Card } from 'antd'
import moment from 'moment'

import styles from '../../../../../assets/css/page-detail.pcss'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import dict from '../../../../../utils/dict.js'
import { conversionUnit } from '../../../../../utils/functions.js'
import { transformUrl, toQueryString } from '../../../../../utils/'

class CrmConsumeDetail extends Component {
  constructor(props) {
    super(props)
    this.ticketId = this.props.match.params.id
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '消费查询',
        url: `/crm/consume`
      },
      {
        title: '消费详情'
      }
    ]
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'crmConsumeDetail/detail',
      payload: {
        id: this.ticketId
      }
    })
  }
  render() {
    const { crmConsumeDetail: { data, parent }, loading  } = this.props
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>消费信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>订单号：</span>{data.ticketId}</div>
              <div><span className={styles.title}>模块编号：</span>{data.deviceSerial}</div>
              <div><span className={styles.title}>楼道信息：</span>{data.device.address}</div>
              <div><span className={styles.title}>消费手机号：</span>{data.mobile}</div>
              <div><span className={styles.title}>消费密码：</span>{data.token}</div>
              <div><span className={styles.title}>消费金额：</span>{conversionUnit(data.value)}</div>
              <div><span className={styles.title}>支付方式：</span>{data.payment.name}</div>
              <div><span className={styles.title}>下单时间：</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
              <div><span className={styles.title}>类型：</span>{data.device[dict.device[data.deviceMode]]}</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>运营商信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>名称：</span>{data.owner.name || '-' }</div>
              <div><span className={styles.title}>服务电话：</span>{data.owner.telephone || '-' }</div>
              <div><span className={styles.title}>手机号：</span>{data.owner.mobile || '-' }</div>
              <div><span className={styles.title}>地址：</span>{data.owner.address || '-' }</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
            <h1>上级运营商信息：</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>名称：</span>{parent.name || '-' }</div>
              <div><span className={styles.title}>服务电话：</span>{parent.telephone || '-' }</div>
              <div><span className={styles.title}>手机号：</span>{parent.mobile || '-' }</div>
              <div><span className={styles.title}>地址：</span>{parent.address || '-' }</div>
            </div>
          </div>
        </Card>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmConsumeDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmConsumeDetail: state.crmConsumeDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(CrmConsumeDetail)
