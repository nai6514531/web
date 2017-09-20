import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker, Modal, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import history from '../../../utils/history.js'
import styles from './index.pcss'

const RangePicker = DatePicker.RangePicker
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '设备查询'
  }
]
const { Option } = Select

class Consume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.checkList = []
    this.columns = [
      { title: '模块号', dataIndex: 'serialNumber', key: 'serialNumber', width: 100 },
      // { title: '经销商', dataIndex: '',key: '' },
      {
        title: '分配人',
        width: 100,
        render: (record) => {
          return (
            `${record.assigner}(${record.assignerMobile})`
          )
        }
      },
      {
        title: '运营商',
        width: 150,
        render: (record) => {
          return (
            `${record.userName}(${record.userMobile || '-'})`
          )
        }
      },
      { title: '楼层', dataIndex: 'address', key: 'address', width: 100 },
      {
        title: '状态',
        width: 100,
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          let statusText = '';
          if(status == 0){
            statusText = '空闲';
          } else if(status == 9) {
            statusText = '锁定';
          } else if(status == 601 || status == 602 || status == 603 || status == 604) {
            statusText = '使用中';
          }
          return statusText;
        }
      },
      {
        title: '价格',
        width: 200 ,
        render: (record) => {
          return (
            `${record.firstPulseName}${record.firstPulsePrice / 100}
            /${record.secondPulseName}${record.secondPulsePrice / 100}
            /${record.thirdPulseName}${record.thirdPulsePrice / 100}
            /${record.fourthPulseName}${record.fourthPulsePrice / 100}`
          )
        }
      },
      { title: '类型', dataIndex: 'referenceDevice',key: 'referenceDevice', width: 200 },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          let action = '/'
          const status = record.status
          if(status == 9) {
            action = <Popconfirm title='确认取消锁定吗?' onConfirm={this.changeStatus.bind(this, record.id, 0)}>
              <a href='javascript:void(0)'>取消锁定</a>
            </Popconfirm>
          }
          else if (status == 0 || status == 2) {
            action = <Popconfirm title='确认锁定吗?' onConfirm={this.changeStatus.bind(this, record.id, 9)}>
              <a href='javascript:void(0)'>锁定</a>
            </Popconfirm>
          }
          else if (status == 601 || status == 602 || status == 603
            || status == 604 || status == 605 || status == 606 || status == 607 || status == 608) {
            action = <Popconfirm title='确认取消占用吗?' onConfirm={this.changeStatus.bind(this, record.id, 0)}>
              <a href='javascript:void(0)'>取消占用</a>
            </Popconfirm>
          }
          // 删除
          return (
            <span>
              {action}
              <Popconfirm title='确认删除吗?' onConfirm={this.reset.bind(this, [record.id])}>
                <a href='javascript:void(0)'>{'\u00A0'}|{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    if( url.keywords || url.deviceSerial ) {
      this.fetch(url)
    }
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: e.target.value }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { keywords, deviceSerial } = this.search
    if(!keywords && !deviceSerial) {
      message.info('请输入筛选条件')
      return
    }
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'crmDevice/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
   this.search = { ...this.search, ...url }
   this.fetch(url)
   // 分页变化时清空checkbox
   this.props.dispatch({
     type: 'crmDevice/updateData',
     payload: {
       selectedRowKeys: []
     }
   })
  }
  changeStatus = (id, status) => {
    this.props.dispatch({
      type: 'crmDevice/status',
      payload: {
        id: id,
        url: this.search,
        data: { status }
      }
    })
  }
  reset = (id) => {
    this.props.dispatch({
      type: 'crmDevice/reset',
      payload: {
        id: id,
        url: this.search
      }
    })
  }
  batchDelete = () => {
    const checkList = this.props.crmDevice.selectedRowKeys
    const self = this
    if(!checkList.length) {
      message.info('请至少选择一个设备')
      return
    }
    Modal.confirm({
      content: `将有${checkList.length}个设备被删除，是否继续？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        self.reset(checkList)
        self.props.dispatch({
          type: 'crmDevice/updateData',
          payload: {
            selectedRowKeys: []
          }
        })
      }
    })
  }
  rowSelection = () => {
    return {
      selectedRowKeys: this.props.crmDevice.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.dispatch({
          type: 'crmDevice/updateData',
          payload: {
            selectedRowKeys
          }
        })
      }
    }
  }
  render() {
    const { crmDevice: { data: { objects, pagination }, selectedRowKeys }, loading  } = this.props
    const startedAt = this.search.startedAt ? moment(this.search.startedAt, dateFormat) : null
    const endedAt = this.search.endedAt ? moment(this.search.endedAt, dateFormat) : null
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <Button
            type='primary'
            className={styles.button}
            onClick={this.batchDelete}
            >
           批量删除
          </Button>
          <Input
            placeholder='运营商名称/账号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'keywords')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.keywords}
           />
          <Input
            placeholder='模块编号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'deviceSerial')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.deviceSerial}
          />
          <span className={styles['button-wrap']}>
            <Button
              type='primary'
              onClick={this.searchClick}
              className={styles.button}
              >
              筛选
            </Button>
          </span>
        </Row>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 1000 }}
          rowSelection={this.rowSelection()}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmDevice/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmDevice: state.crmDevice,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Consume)
