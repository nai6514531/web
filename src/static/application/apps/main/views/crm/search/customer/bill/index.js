import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../../utils/'
import styles from './index.pcss'
import DatePicker from '../../../../../components/date-picker/'
import moment from 'moment'

const Option = Select.Option

const dict = {
  1: '充值',
  2: '洗衣/其他',
  3: '赠送洗衣金',
  4: '退款'
}
class Bill extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.breadItems = [
      {
        title: '客服系统'
      },
      {
        title: '用户查询'
      },
      {
        title: 'C端用户',
        url: `/crm/search/customer?mobile=${this.props.match.params.id}`
      },
      {
        title: '余额明细'
      }
    ]
    this.columns = [
      {
        title: '收入/支出',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          return(
            record.action === 1 ? '收入' : '支出'
          )
        }
      },
      {
        title: '业务名称',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => {
          return(
            dict[record.type] || '-'
          )
        }
      },
      {
        title: '金额',
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => {
          if(record.action === 1) {
            return(
              <span style={{color: 'green'}}>+{(record.value / 100).toFixed(2)}</span>
            )
          }
          return(
            <span style={{color: 'red'}}>-{(record.value / 100).toFixed(2)}</span>
          )
        }
      },
      {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        render: (text, record) => {
          return`${moment(record.time).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      { title: '订单号', dataIndex: 'billId',key: 'billId' },
      { title: '第三方订单号', dataIndex: 'outerBillId',key: 'outerBillId' },
    ]
  }
  componentDidMount() {
    const url = this.search
    if(url.action) {
      this.props.dispatch({
        type: 'crmBill/updateAppData',
        payload: {
          id: url.action
        }
      })
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
  }
  selectHandler =  (type, value) => {
    if(value) {
      this.search = { ...this.search, [type]: value }
    } else {
      delete this.search[type]
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if(type === 'action') {
      delete this.search.type
      this.props.dispatch({
        type: 'crmBill/updateAppData',
        payload: {
          id: value
        }
      })
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            type: undefined
          }
        }
      })
    }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch =(url) => {
    const mobile = this.props.match.params.id
    this.props.dispatch({
      type: 'crmBill/list',
      payload: {
        data: {
          url,
          mobile
        }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    const {  common: { search }, crmBill: { data: { objects, pagination }, appData }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DatePicker
          search={this.search}
          defaultTime={false}/>
        <Select
          placeholder='收入/支出'
          className={styles.select}
          allowClear
          defaultValue={ this.search.action }
          onChange={this.selectHandler.bind(this, 'action')}>
            <Option value={'1'}>收入</Option>
            <Option value={'2'}>支出</Option>
        </Select>
        <Select
          placeholder='业务名称'
          className={styles.select}
          allowClear
          value={ search.type }
          onChange={this.selectHandler.bind(this, 'type')}>
            {
              appData.map(value => {
                return (
                  <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          筛选
        </Button>
        {/* <span className={styles.info}>
          { `账户余额： xx元 \u00A0 | \u00A0 收入： xx元 \u00A0 |  \u00A0 支出： xx元` }
        </span> */}
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 800 }}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmBill/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    crmBill: state.crmBill,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Bill)
