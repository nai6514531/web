import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm } from 'antd'
import DataTable from '../../components/data-table/'
import Breadcrumb from '../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../utils/'
import history from '../../utils/history.js'

const breadItems = [
  {
    title: '平台管理'
  },
  {
    title: '应用管理'
  }
]

class Platform extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '应用ID', dataIndex: 'appId', key: 'appId' },
      { title: '应用名', dataIndex: 'name',key: 'name' },
      { title: '应用说名', dataIndex: 'description',key: 'description' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/platform/application/${record.appId}`}>编辑</Link> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.appId) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    this.fetch(url)
  }
  delete = (appId) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'platform/delete',
      payload: {
        id: appId,
        data: url
      }
    })
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'platform/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
   this.fetch(url)
  }
  render() {
    const { platform: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Link
          to={`/platform/application/new`}>
          <Button
            type='primary'
            style={{marginBottom: '20px'}}
            >
          添加应用
          </Button>
        </Link>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'platform/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    platform: state.platform,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Platform)
