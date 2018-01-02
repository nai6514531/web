import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from '../../../assets/css/search-bar.pcss'

const Option = Select.Option
const breadItems = [
  {
    title: '业务配置系统'
  },
  {
    title: '广告位管理'
  }
]

class AdPosition extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '广告位ID', dataIndex: 'adPositionId', key: 'adPositionId' },
      { title: '名称', dataIndex: 'name',key: 'name' },
      { title: '所属应用', dataIndex: 'appName',key: 'appName' },
      {
        title: '是否需要登录状态',
        render: (text, record, index) => {
          return record.identifyNeeded ? '是' : '否'
        }
      },
      { title: '广告位说明', dataIndex: 'description',key: 'description' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/advertisement/position-manager/${record.adPositionId}`}>编辑</Link> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.adPositionId) } >
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
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
  }
  delete = (adPositionId) => {
    const url = this.search
    this.props.dispatch({
      type: 'adPosition/delete',
      payload: {
        id: adPositionId,
        data: url
      }
    })
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
    this.props.dispatch({
      type: 'adPosition/list',
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
    const { common: { search }, adPosition: { data: { objects, pagination }, appData }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          value={ search.appId }
          allowClear
          className={styles.input}
          placeholder='所属应用'
          onChange={this.selectHandler.bind('this','appId')}>
            {
              appData.map(value => {
                return (
                  <Option value={value.appId + ''} key={value.appId}>{value.name}</Option>
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
        <Link
          to={`/advertisement/position-manager/new`}>
            <Button
              type='primary'
              className={styles.button}>
              添加广告位
            </Button>
        </Link>
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
    this.props.dispatch({ type: 'adPosition/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    adPosition: state.adPosition,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(AdPosition)
