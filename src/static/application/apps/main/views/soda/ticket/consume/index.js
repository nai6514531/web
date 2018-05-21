import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import op from 'object-path'
import { Button, Popconfirm, Input, Select, Row, Modal, message } from 'antd'
import moment from 'moment'
import { trim } from 'lodash'

import { InputScan } from '../../../../components/form/input'
import DataTable from '../../../../components/data-table'
import Breadcrumb from '../../../../components/layout/breadcrumb'
import { Element } from '../../../../components/element'
import { transformUrl, toQueryString } from '../../../../utils'
import TICKET from '../../../../constant/ticket'
import DEVICE from '../../../../constant/device'
import USER from '../../../../constant/user'
import DatePicker from '../../../../components/date-picker'

import styles from '../../../../assets/css/search-bar.pcss'

const breadItems = [
  {
    title: '消费查询'
  }
]
const { Option } = Select

@Element()
class Consume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    let { isVisible } = this.props
    this.columns = [
      { title: '订单号', dataIndex: 'ticketId', key: 'ticketId',width: 150 },
      { 
        title: '运营商', 
        colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_NAME') ? 1 : 0,
        dataIndex: 'owner.name',
        key: 'owner.name', 
        width: 100,
        render: (name) => {
          return {
            children: `${name}`,
            props: {
              colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_NAME') ? 1 : 0
            }
          }
        }
      },
      { 
        title: '服务电话', 
        colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_TELEPHONE') ? 1 : 0,
        dataIndex: 'owner.telephone',
        key: 'owner.telephone', 
        width: 100,
        render: (telephone) => {
          return {
            children: `${telephone}`,
            props: {
              colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_TELEPHONE') ? 1 : 0
            }
          }
        }
      },
      { 
        title: '服务地点', 
        dataIndex: 'device.address', 
        key: 'device.address',
        width: 100,
        render:(address) => {
          return  `${address || '-'}`
        }
      },
      { title: '模块编号', dataIndex: 'serial',key: 'serial', width: 100 },
      { title: '消费手机号', dataIndex: 'mobile',key: 'mobile', width: 100 },
      { title: '消费密码', dataIndex: 'token',key: 'token', width: 100 },
      {
        title: '消费金额',
        width: 100,
        render:(text, record) => {
          return  `${(record.value/100).toFixed(2)}元`
        }
      },
      {
        title: '类型',
        width: 50,
        colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_MODE_NAME') ? 1 : 0,
        render: (text, record) => {
          let names = (op(record).get('snapshot.modes') || []).map((mode) => {
            return mode.name
          })
          return {
            children: <span>{names.join('/')}</span>,
            props: {
              colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_MODE_NAME') ? 1 : 0
            }
          }
        }
      },
      {
        title: '支付方式',
        colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_PAYMENT_TYPE') ? 1 : 0,
        width: 70,
        dataIndex: 'payment.name',
        key: 'payment.name',
        render: (name) => {
          return {
            children: `${name}`,
            props: {
              colSpan: isVisible('TICKET_CONSUME:TEXT:SHOW_PAYMENT_TYPE') ? 1 : 0
            }
          }
        }
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
          let suffix
          let { user, location: { pathname } } = this.props
          let { status: { value }, paymentId, ticketId, createdAt, timestamp } = record
          let isBusiness = user.id !== USER.ID_IS_ROOT_ADMIN && (user.parentId !== USER.ID_IS_ROOT_ADMIN || user.type === USER.TYPE_IS_DEFAULT)
          let isICCard = paymentId === TICKET.PAYMENT_TYPE_IS_IC
          let showDetail = isVisible('TICKET_CONSUME:BUTTON:DETAIL')
          pathname = pathname.split('/')[1]

          if (value === TICKET.CONSUME_STATUS_IS_REFUND) {
            suffix = <span style={{color: '#666'}}>已退款</span>
          }
          if (!!~[TICKET.DRINKING_CONSUME_STATUS_IS_SETTLED, TICKET.CONSUME_STATUS_IS_DELIVERED].indexOf(value) && isVisible('TICKET_CONSUME:BUTTON:REFUND')) {
            if (!isBusiness || moment(createdAt).isSame(timestamp, 'day') && isBusiness) {
              suffix = <span>
                <Popconfirm title='确认退款吗?' onConfirm={this.refund.bind(this, ticketId)} >
                  <a href='javascript:void(0)'>退款</a>
                </Popconfirm>
              </span>
            }
          }
          return(
            <span>
              { showDetail ? <Link to={`/${pathname}/consume/${record.ticketId}`}>详情</Link> : null }
              { showDetail ? (!isICCard && !!suffix ? ' | ' : null) : null}
              { !showDetail && (isICCard || !suffix) ? '-' : null }
              { !isICCard ? suffix : null }
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
    let { user, location: { pathname } } = this.props
    let isDrinkingWater = !!~pathname.indexOf('soda-drinking')
    let isBusiness = user.id !== USER.ID_IS_ROOT_ADMIN && (user.parentId !== USER.ID_IS_ROOT_ADMIN || user.type === USER.TYPE_IS_DEFAULT)
    let status = isBusiness ? ( isDrinkingWater ? [TICKET.DRINKING_CONSUME_STATUS_IS_SETTLED, TICKET.CONSUME_STATUS_IS_REFUND] :
      [TICKET.CONSUME_STATUS_DELIVERY_FAILURE, TICKET.CONSUME_STATUS_IS_REFUND, TICKET.CONSUME_STATUS_IS_DELIVERED]) :
      ( isDrinkingWater ? '' : [TICKET.CONSUME_STATUS_IS_REFUND, TICKET.CONSUME_STATUS_IS_DELIVERED])

    this.props.dispatch({
      type: 'consume/list',
      payload: {
        data: { 
          ...url, 
          status: (status || []).join(','),
          type: isDrinkingWater ? DEVICE.FEATURE_TYPE_IS_DRINKING_WATER : 0,
        }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  export = () => {
    const { customerMobile, deviceSerial, keywords, endAt, startAt } = this.search
    let { user, location: { pathname } } = this.props
    let isDrinkingWater = !!~pathname.indexOf('soda-drinking')
    let isBusiness = user.id !== USER.ID_IS_ROOT_ADMIN && (user.parentId !== USER.ID_IS_ROOT_ADMIN || user.type === USER.TYPE_IS_DEFAULT)
    let status = isBusiness ? ( isDrinkingWater ? [TICKET.DRINKING_CONSUME_STATUS_IS_SETTLED, TICKET.CONSUME_STATUS_IS_REFUND] :
      [TICKET.CONSUME_STATUS_DELIVERY_FAILURE, TICKET.CONSUME_STATUS_IS_REFUND, TICKET.CONSUME_STATUS_IS_DELIVERED]) :
      ( isDrinkingWater ? '' : [TICKET.CONSUME_STATUS_IS_REFUND, TICKET.CONSUME_STATUS_IS_DELIVERED])

    if(!startAt || !endAt) {
      message.info('请选择日期')
      return
    }
    if( !customerMobile && !keywords && !deviceSerial ) {
      message.info('请先筛选再导出')
      return
    }
    this.props.dispatch({
      type: 'consume/export',
      payload: {
        data: { 
          ...this.search, 
          status: (status || []).join(','),
          type: isDrinkingWater ? DEVICE.FEATURE_TYPE_IS_DRINKING_WATER : 0,
        }
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'consume/hideModal'
    })
  }
  refund = (id) => {
    let { location: { pathname } } = this.props

    this.props.dispatch({
      type: 'consume/refund',
      payload: {
        id: id,
        type: !!~pathname.indexOf('soda-drinking') ? DEVICE.FEATURE_TYPE_IS_DRINKING_WATER : 0,
        data: { 
          ...this.search,
        }
      }
    })
  }
  render() {
    const { consume: { date, data: { objects, pagination }, key, visible, exportUrl }, loading, isVisible } = this.props
    pagination && (pagination.showSizeChanger = true)

    return(
      <div>
        <Breadcrumb items={breadItems} />
          <DatePicker
            date={date}
            search={this.search}
            defaultTime={true}/>
          {
            isVisible('TICKET_CONSUME:INPUT:NAME') ? <Input
              placeholder='运营商名称/账号'
              className={styles.input}
              onChange={this.changeHandler.bind(this, 'keywords')}
              onPressEnter={this.searchClick}
              defaultValue={this.search.keywords}
             /> : null
          }
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
    this.props.dispatch({ type: 'consume/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    user: state.common.userInfo.user,
    consume: state.consume,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Consume)
