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
    title: 'IC卡明细'
  }
]

class Chipcard extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '充值/消费', dataIndex: 'id', key: 'id' },
      { title: '金额', dataIndex: 'name',key: 'name' },
      { title: '时间', dataIndex: 'appName',key: 'appName' },
      {
        title: '充值商家',
        render: (text, record, index) => {
          return record.identifyNeeded ? '是' : '否'
        }
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
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch =(url) => {
    this.props.dispatch({
      type: 'crmChipcard/list',
      payload: {
        data: url
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
        <Breadcrumb items={breadItems} />
        <span className={styles['button-wrap']}>
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
