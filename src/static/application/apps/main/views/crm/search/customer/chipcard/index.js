import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../../utils/'
import styles from '../../../../../assets/css/search-bar.pcss'
import DatePicker from '../../../../../components/date-picker/'
import moment from 'moment'

const Option = Select.Option
class Chipcard extends Component {
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
        title: 'IC卡明细'
      }
    ]
    this.columns = [
      {
        title: '充值/消费',
        dataIndex: 'action',
        key: 'action',
        render: (text, record, index) => {
          return record.action === 1 ? '充值' : '消费'
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
      {
        title: '充值商家',
        dataIndex: 'operator',
        key: 'operator'
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
  }
  selectHandler =  (type, value) => {
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if(value) {
      this.search = { ...this.search, [type]: value }
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
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch =(url) => {
    const mobile = this.props.match.params.id
    this.props.dispatch({
      type: 'crmChipcard/list',
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
    const { crmChipcard: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DatePicker
          search={this.search}
          defaultTime={false}/>
        <Select
          placeholder='充值/消费'
          className={styles.input}
          allowClear
          defaultValue={this.search.action}
          onChange={this.selectHandler.bind(this, 'action')}>
            <Option value={'1'}>充值</Option>
            <Option value={'2'}>消费</Option>
        </Select>
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          筛选
        </Button>
        {/* <span className={styles.info}>
          { `IC卡余额： xx元 \u00A0 | \u00A0 充值： xx元 \u00A0 |  \u00A0 消费： xx元` }
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
    this.props.dispatch({ type: 'crmChipcard/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    crmChipcard: state.crmChipcard,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Chipcard)
