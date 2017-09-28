import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../../utils/'
import styles from './index.pcss'
import history from '../../../../../utils/history.js'
import DatePicker from '../../../../../components/date-picker/'

const Option = Select.Option
const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '用户查询'
  },
  {
    title: 'C端用户'
  },
  {
    title: '余额明细'
  }
]

class Wallet extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '收入/支出', dataIndex: 'id', key: 'id' },
      { title: '业务名称', dataIndex: 'name',key: 'name' },
      { title: '金额', dataIndex: 'appName',key: 'appName' },
      {
        title: '时间',
        render: (text, record, index) => {
          return record.identifyNeeded ? '是' : '否'
        }
      },
      { title: '订单号', dataIndex: 'description',key: 'description' },
      {
        title: '第三方订单号',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/advertisement/position-manager/${record.id}`}>编辑</Link> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    this.fetch(url)
    console.log('this.searc',this.search)
  }
  selectHandler =  (type, value) => {
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
    console.log('this.searc',this.search)
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    history.push(`${location.pathname}?${queryString}`)
    // this.fetch(this.search)
  }
  fetch =(url) => {
    const mobile = this.props.match.params.id
    this.props.dispatch({
      type: 'crmWallet/list',
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
    const { crmWallet: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <span className={styles['input-wrap']}>
          <DatePicker
            search={this.search}
            defaultTime={false}/>
          <Select
            placeholder='请选择展示状态'
            style={{width: 100}}
            onChange={this.selectHandler.bind(this, 'displayStrategy')}>
              <Option value={'0'}>收入</Option>
              <Option value={'1'}>支出</Option>
          </Select>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            筛选
          </Button>
        </span>
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
    this.props.dispatch({ type: 'crmWallet/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    crmWallet: state.crmWallet,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Wallet)
