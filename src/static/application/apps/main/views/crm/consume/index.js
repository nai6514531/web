import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, Modal, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import history from '../../../utils/history.js'
import styles from './index.pcss'
import DatePicker from '../../../components/date-picker/'
const breadItems = [
  {
    title: '客服系统'
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
      { title: '订单号', dataIndex: 'ticketId', key: 'ticketId' },
      // { title: '经销商', dataIndex: 'agency',key: 'agency' },
      { title: '上级运营商', dataIndex: 'parentOperator', key: 'parentOperator', width: 100 },
      { title: '运营商名称', dataIndex: 'operator',key: 'operator', width: 100 },
      { title: '服务电话', dataIndex: 'telephone', key: 'telephone', width: 100 },
      { title: '模块编号', dataIndex: 'deviceSerial',key: 'deviceSerial', width: 100 },
      { title: '楼道信息', dataIndex: 'address', key: 'address', width: 100 },
      { title: '消费手机号', dataIndex: 'mobile',key: 'mobile', width: 100 },
      { title: '消费密码', dataIndex: 'password',key: 'password', width: 100 },
      { title: '类型', dataIndex: 'typeName', key: 'typeName', width: 50 },
      {
        title: '消费金额',
        width: 50,
        render:(text, record) => {
          return record.value / 100
        }
      },
      { title: '支付方式', dataIndex: 'payment',key: 'payment', width: 70 },
      {
        title: '下单时间',
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
          if(record.status !== 7) {
            return
          }
          return (
            <span>
              <Popconfirm title='确认退款吗?' onConfirm={ this.refund.bind(this,record.ticketId) } >
                <a href='javascript:void(0)'>{'\u00A0'}退款</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    const { customerMobile, keywords, deviceSerial, startAt, endAt } = url
    if( customerMobile || keywords || deviceSerial || startAt || endAt ) {
      this.fetch(url)
    }
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: e.target.value }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'crmConsume/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
   this.fetch(url)
  }
  export = () => {
    const { customerMobile, deviceSerial, keywords, endAt, startAt } = this.search
    if(!customerMobile && !deviceSerial && !keywords && !endAt && !startAt) {
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
    const { crmConsume: { data: { objects, pagination }, key, visible, exportUrl }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <span className={styles.input}>
          <DatePicker search={this.search}/>
          </span>
          <Input
            placeholder='运营商名称账号'
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
          <Input
            placeholder='模块编号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'deviceSerial')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.deviceSerial}
          />
          <span className={styles['button-wrap']}>
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
          </span>
        </Row>
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
            <span className="form-text">确认导出这批账单吗？</span>
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
