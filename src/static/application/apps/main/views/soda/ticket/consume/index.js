import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, Modal, message } from 'antd'
import moment from 'moment'
import { trim } from 'lodash'

import { InputScan } from '../../../../components/form/input'
import DataTable from '../../../../components/data-table'
import Breadcrumb from '../../../../components/layout/breadcrumb'
import { transformUrl, toQueryString } from '../../../../utils'
import DatePicker from '../../../../components/date-picker'
import dict from '../../../../utils/dict.js'

import styles from '../../../../assets/css/search-bar.pcss'

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '消费查询'
  }
]
const { Option } = Select

class Consume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '订单号', dataIndex: 'ticketId', key: 'ticketId',width: 150 },
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
      // { title: '运营商名称', dataIndex: 'owner.name',key: 'owner.name', width: 100 },
      // { title: '服务电话', dataIndex: 'owner.telephone', key: 'owner.telephone', width: 100 },
      { title: '模块编号', dataIndex: 'deviceSerial',key: 'deviceSerial', width: 100 },
      { title: '楼道信息', dataIndex: 'device.address', key: 'device.address', width: 100 },
      { title: '消费手机号', dataIndex: 'mobile',key: 'mobile', width: 100 },
      { title: '消费密码', dataIndex: 'token',key: 'token', width: 100 },
      {
        title: '类型',
        width: 50,
        render: (text, record) => {
          return (
            record.device[dict.device[record.deviceMode]]
          )
        }
      },
      {
        title: '消费金额',
        width: 50,
        render:(text, record) => {
          return record.value / 100
        }
      },
      {
        title: '支付方式',
        width: 70,
        dataIndex: 'payment.name',
        key: 'payment.name',
      },
      {
        title: '下单时间',
        width: 100,
        render: (text, record) => {
          return (
            `${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        width: 100,
        render: (text, record, index) => {
         let refund
          if(record.status.value === 4) {
            refund = <span style={{color: '#666'}}>已退款</span>
          }
          if(record.paymentId === 4) {
            // ic卡不支持退款
            refund = <span style={{color: '#666'}}>/</span>
          }
          if(record.status.value === 7) {
            refund = <span>
                      <Popconfirm title='确认退款吗?' onConfirm={ this.refund.bind(this,record.ticketId) } >
                        <a href='javascript:void(0)'>退款</a>
                      </Popconfirm>
                    </span>
          }
          return(
            <span>
              <Link to={`/crm/consume/${record.ticketId}`}>详情{'\u00A0'} | {'\u00A0'}</Link>
              { refund }
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    const { customerMobile, keywords, deviceSerial, startAt, endAt, limit, offset } = url
    if(!this.search.startAt || !this.search.endAt) {
      message.info('请选择日期')
      return
    }
    if( !customerMobile && !keywords && !deviceSerial ) {
      // message.info('请选择筛选条件')
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
    const { customerMobile, keywords, deviceSerial, startAt, endAt, limit, offset } = this.search
    if(!startAt || !endAt) {
      message.info('请选择日期')
      return
    }
    if( !customerMobile && !keywords && !deviceSerial ) {
      message.info('请选择筛选条件')
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
      type: 'crmConsume/list',
      payload: {
        data: { ...url, status: '4,7' }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  export = () => {
    const { customerMobile, deviceSerial, keywords, endAt, startAt } = this.search
    if(!startAt || !endAt) {
      message.info('请选择日期')
      return
    }
    if( !customerMobile && !keywords && !deviceSerial ) {
      message.info('请先筛选再导出')
      return
    }
    this.props.dispatch({
      type: 'crmConsume/export',
      payload: {
        data: this.search
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'crmConsume/hideModal'
    })
  }
  refund = (id) => {
    this.props.dispatch({
      type: 'crmConsume/refund',
      payload: {
        id: id,
        data: this.search
      }
    })
  }
  render() {
    const { crmConsume: { date, data: { objects, pagination }, key, visible, exportUrl }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
          <DatePicker
            date={date}
            search={this.search}
            defaultTime={true}/>
          <Input
            placeholder='运营商名称/账号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'keywords')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.keywords}
           />
          <Input
            placeholder='消费手机号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'customerMobile')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.customerMobile}
          />
          <InputScan
            placeholder='模块编号'
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
          wrapClassName="exportModal"
          visible={visible}
          onCancel={this.hide}
          key={key}
        >
          <form name="export" >
            <span className="form-text">确定导出这批订单吗？</span>
            <button onClick={this.hide} type="button" id="cancel">取消</button>
            <a href={exportUrl} target="_blank" id="submit" download onClick={this.hide}>确认</a>
          </form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmConsume/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmConsume: state.crmConsume,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Consume)
