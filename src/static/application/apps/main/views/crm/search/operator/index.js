import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Input, Button, message } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import styles from '../../../../assets/css/search-bar.pcss'
import { trim } from 'lodash'
import InputWithClear from '../../../../components/input-with-clear/'

const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '用户查询'
  },
  {
    title: 'B端用户'
  }
]

class Operator extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '用户ID', dataIndex: 'id', key: 'id' },
      { title: '登录账号', dataIndex: 'account',key: 'account' },
      {
        title: '角色',
        render: (record) => {
          return (
            !record.role.length ? '-' : record.role.map( (value, index) => {
              return `${value.name}${record.role.length !== index + 1 ? ',' : ''}`
            })
          )
        }
      },
      {
        title: '运营商名称',
        render: (record) => {
          return (
            `${record.name}(${record.mobile || '-' })`
          )
        }
      },
      { title: '地址', dataIndex: 'address',key: 'address' },
      // { title: '经销商', dataIndex: 'name',key: 'name' },
      {
        title: '上级运营商',
        render: (record) => {
          return (
            `${record.parent.name}(${record.parent.mobile || '-' })`
          )
        }
      },
      { title: '模块数量', dataIndex: 'deviceCount',key: 'deviceCount' },
      {
        title: '操作',
        render: (record) => {
          return (
            <Link to={`/crm/search/operator/${record.id}?keywords=${this.search.keywords}`}>详情</Link>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const { keywords } = this.search
    if(keywords) {
      this.fetch(this.search)
    }
  }
  changeHandler = (type, value) => {
    if(value) {
      this.search = { ...this.search, [type]: trim(value) }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { keywords } = this.search
    if(!keywords) {
      message.info('请输入筛选条件')
      return
    }
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'crmOperator/list',
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
    const { crmOperator: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <span className={styles.input}>
          <InputWithClear
            placeholder='运营商名称/登录账号'
            onChange={this.changeHandler.bind(this, 'keywords')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.keywords}
          />
        </span>
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          筛选
        </Button>
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
    this.props.dispatch({ type: 'crmOperator/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmOperator: state.crmOperator,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Operator)
