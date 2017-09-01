import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from './index.pcss'

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
    const search = transformUrl(location.hash)
    delete search.page
    delete search.per_page
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '名称', dataIndex: 'name',key: 'name' },
      { title: '所属业务', dataIndex: 'appName',key: 'appName' },
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
              <Link to={`/advertisement/position-manager/${record.id}`}>修改</Link> |
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
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.props.dispatch({
      type: 'adPosition/list',
      payload: {
        data: url
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'adPosition/delete',
      payload: {
        id: id
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
    this.props.dispatch({ type: 'common/resetIndex' })
    location.hash = toQueryString({ ...this.search })
  }
  render() {
    const { common: { search }, adPosition: { data: { objects, pagination }, appData }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          value={ search.app_id }
          allowClear
          className={styles.input}
          placeholder='所属业务'
          onChange={this.selectHandler.bind('this','app_id')}>
            {
              appData.map(value => {
                return (
                  <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            筛选
          </Button>
        </span>
        <Button
          type='primary'
          style={{marginBottom: '20px'}}
          >
          <Link to={`/advertisement/position-manager/new`}>添加广告位</Link>
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adPosition/clear'})
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
