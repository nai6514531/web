import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, Modal, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import styles from '../../../assets/css/search-bar.pcss'
import { trim } from 'lodash'

const breadItems = [
  {
    title: '商家系统'
  },
  {
    title: '消费查询'
  }
]
const { Option } = Select
const confirm = Modal.confirm

const dict = {
  '1' : 'firstPulseName',
  '2' : 'secondPulseName',
  '3' : 'thirdPulseName',
  '4' : 'fourthPulseName',
}

class Consume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      // { title: '订单号', dataIndex: 'ticketId', key: 'ticketId',width: 150 },
      // { title: '经销商', dataIndex: 'agency',key: 'agency' },
      // {
      //   title: '上级运营商',
      //   width: 150,
      //   render: (record) => {
      //     return (
      //       `${record.parentOperator}(${record.parentOperatorMobile || '-' })`
      //     )
      //   }
      // },
      { title: '序号', dataIndex: 'key',key: 'key', width: 50 },
      { title: '运营商', dataIndex: 'owner.name',key: 'owner.name', width: 100 },
      { title: '服务电话', dataIndex: 'owner.telephone', key: 'owner.telephone', width: 100 },
      { title: '模块编号', dataIndex: 'deviceSerial',key: 'deviceSerial', width: 100 },
      { title: '楼道信息', dataIndex: 'device.address', key: 'device.address', width: 100 },
      { title: '洗衣手机号', dataIndex: 'mobile',key: 'mobile', width: 100 },
      { title: '洗衣密码', dataIndex: 'token',key: 'token', width: 100 },
      {
        title: '洗衣金额',
        width: 100,
        render:(text, record) => {
          return  `${(record.value/100).toFixed(2)}元`
        }
      },
      {
        title: '洗衣类型',
        width: 100,
        render: (text, record) => {
          return (
            record.device[dict[record.deviceMode]]
          )
        }
      },
      // {
      //   title: '支付方式',
      //   width: 70,
      //   dataIndex: 'payment.name',
      //   key: 'payment.name',
      // },
      {
        title: '下单时间',
        width: 120,
        render: (text, record) => {
          return (
            `${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        width: 50,
        render: (text, record, index) => {
          if(record.status.value === 4) {
            return (
              <span style={{color: '#666'}}>已退款</span>
            )
          }
          if(record.paymentId === 4) {
            // ic卡不支持退款
            return (
              <span style={{color: '#666'}}>/</span>
            )
          }
          if(record.status.value === 7) {
            const createdAt = moment(record.createdAt).format('YYYY-MM-DD')
            const today = moment(new Date()).format('YYYY-MM-DD')
            if(createdAt == today && record.ownerId == this.props.common.userInfo.user.id ) {
              // 运营商可针对在自己名下的当日消费订单进行退款
              return (
                <span>
                  <a href='javascript:void(0)' onClick={ this.showConfirm.bind(this,record.ticketId) }>退款</a>
                </span>
              )
            }
            return (
              <span style={{color: '#666'}}>/</span>
            )
          }
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    const { customerMobile, deviceSerial } = url
    if( !customerMobile && !deviceSerial ) {
      // message.info('请输入手机号或模块编号进行查询')
      return
    }
    this.fetch(url)
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: trim(e.target.value) }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { customerMobile, deviceSerial } = this.search
    if( !customerMobile && !deviceSerial ) {
      message.info('请输入手机号或模块编号进行查询')
      return
    }
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'businessConsume/list',
      payload: {
        data: { ...url, status: '4,6,7' }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(this.search)
  }
  export = () => {
    const { customerMobile, deviceSerial } = this.search
    if( !customerMobile && !deviceSerial ) {
      message.info('请先筛选再导出')
      return
    }
    this.props.dispatch({
      type: 'businessConsume/export',
      payload: {
        data: { ...this.search, status : '4,6,7' }
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'businessConsume/hideModal'
    })
  }
  showConfirm = (id) => {
    const url = transformUrl(location.search)
    const self = this
    confirm({
      title: '确认退款?',
      content: '款项将退到消费用户的苏打生活账户余额，确认退款吗?',
      onOk() {
        self.props.dispatch({
          type: 'businessConsume/refund',
          payload: {
            id: id,
            data: { ...url, userId: self.props.common.userInfo.user.id }
          }
        })
      }
    })
  }
  render() {
    const { businessConsume: {  data: { objects, pagination }, key, visible, exportUrl }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='请输入洗衣手机号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'customerMobile')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.customerMobile}
        />
        <Input
          placeholder='请输入模块编号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'deviceSerial')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.deviceSerial}
        />
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          icon='search'
          >
          筛选
        </Button>
        <Button
          type='primary'
          className={styles.button}
          onClick={this.export}
          icon='download'
          >
          导出
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 1000 }}
          rowKey='ticketId'
        />
        <Modal title="导出"
          wrapClassName="playModal"
          visible={visible}
          onCancel={this.hide}
          key={key}
        >
          <form name="export" >
            <span className="form-text">确定导出这批消费记录吗？</span>
            <button onClick={this.hide} type="button" id="cancel">取消</button>
            <a href={exportUrl} target="_blank" id="submit" download onClick={this.hide}>确认</a>
          </form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'businessConsume/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    businessConsume: state.businessConsume,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Consume)
