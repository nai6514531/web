import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, Input } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
import gameService from '../../../services/game/game'
import styles from './index.pcss'

const Option = Select.Option
const confirm = Modal.confirm
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

const breadItems = [
  {
    title: '游戏平台管理'
  },
  {
    title: '供应商管理'
  }
]
class Supplier extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      {
        title: '序号',
        key: 'index',                
        render: (text, record, index) => {
          const pagination = this.props.supplier.data.pagination
          return index + pagination.from
        }
      },
      { title: '供应商名', dataIndex: 'name', key: 'name' },
      { title: '供应商ID', dataIndex: 'id', key: 'id' },
      { title: '联系人', dataIndex: 'contact', key: 'contact' },  
      { title: '联系电话', dataIndex: 'telephone', key: 'telephone' },    
      {
        title: '供应商状态',
        key: 'status',        
        render: (text, record, index) => {
          return record.status ? '禁用' : '正常'
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/game/supplier/${record.id}`}>编辑</Link> 
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
    this.props.dispatch({
      type: 'supplier/allSuppliers',
      payload: {}
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
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch =(url) => {
    this.props.dispatch({
      type: 'supplier/list',
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
    const { common: { search }, supplier: { data: { objects, pagination }, allSuppliers }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    const statusList = [{status: 0, title: '正常'}, {status: 1, title: '禁用'}]
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row>
        <Select
          value={ search.id }
          showSearch
          allowClear
          style={{ width: 150, marginRight: 20 }}          
          placeholder="供应商名"
          optionFilterProp="children"
          onChange={this.selectHandler.bind('this','id')}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
         {
          allSuppliers.map(value => {
            return (
              <Option value={value.id + ''} key={value.id}>{value.name}</Option>
            )
          })
        }
        </Select>
        <Select
          value={ search.status }
          allowClear
          style={{ width: 150, marginRight: 20 }}          
          placeholder="供应商状态"
          onChange={this.selectHandler.bind('this','status')}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
         {
          statusList.map(value => {
            return (
              <Option value={value.status + ''} key={value.status}>{value.title}</Option>
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
        </Row>
        <Row className={styles['input-wrap']}>
            <Link
              to={`/game/supplier/new`}>
              <Button
                type='primary'
                className={styles.button}>
                新增
              </Button>
            </Link>
        </Row>
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
    this.props.dispatch({ type: 'supplier/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    supplier: state.supplier,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Supplier)
