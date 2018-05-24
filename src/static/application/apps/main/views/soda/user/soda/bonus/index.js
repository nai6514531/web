import { Button, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { Component } from 'react';
import styles from '../../../../../assets/css/search-bar.pcss';
import DataTable from '../../../../../components/data-table/';
import DatePicker from '../../../../../components/date-picker/';
import Breadcrumb from '../../../../../components/layout/breadcrumb/';
import { toQueryString, transformUrl } from '../../../../../utils/';

const Option = Select.Option

const dict = {
  1: '充值',
  2: '消费(洗衣)',
  3: '赠送现金',
  4: '退款'
}
class Bonus extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '用户查询'
      },
      {
        title: 'C端用户',
        url: `/soda/user?mobile=${this.props.match.params.id}`
      },
      {
        title: '鼓励金明细'
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
    ]
  }
  componentDidMount() {
    const url = this.search
    if(url.action) {
      this.props.dispatch({
        type: 'sodaBonus/updateAppData',
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
  selectHandler = (key, value) => {
    if(value) {
      this.search = { ...this.search, [key]: value }
    } else {
      delete this.search[key]
    }
    if(key === 'action') {
      delete this.search.type
      this.props.dispatch({
        type: 'sodaBonus/updateAppData',
        payload: {
          id: value
        }
      })
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            action: value,
            type: null
          }
        }
      })
    } else if(key === 'type'){
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            type: value
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
      type: 'sodaBonus/list',
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
    const {  common: { search }, sodaBonus: { data: { objects, pagination }, appData }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DatePicker
          search={this.search}
          defaultTime={false}/>
        <Select
          placeholder='收入/支出'
          className={styles.input}
          allowClear
          value={ this.search.action }
          onChange={this.selectHandler.bind(this, 'action')}>
            <Option value={'1'}>收入</Option>
            <Option value={'2'}>支出</Option>
        </Select>
        <Select
          placeholder='业务名称'
          className={styles.input}
          allowClear
          value={ this.search.type }
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
    this.props.dispatch({ type: 'sodaBonus/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    sodaBonus: state.sodaBonus,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Bonus)
