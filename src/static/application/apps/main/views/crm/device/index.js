import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker, Modal, message } from 'antd'
import moment from 'moment'
import { trim } from 'lodash'
import _ from 'lodash'
import { InputScan } from '../../../components/form/input'
import DataTable from '../../../components/data-table'
import Breadcrumb from '../../../components/layout/breadcrumb'
import { transformUrl, toQueryString } from '../../../utils'
import dict from '../../../utils/dict.js'

import styles from '../../../assets/css/search-bar.pcss'

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

class Device extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.checkList = []
    this.columns = [
      {
        title: '模块号',
        width: 100,
        render: (record) => {
          const { keywords, deviceSerial } = this.search
          return  <Link to={`/crm/device/${record.serialNumber}?deviceSerial=${deviceSerial || ''}&keywords=${keywords || ''}`}>{record.serialNumber}</Link>
        }
      },
      {
        title: '运营商',
        width: 150,
        render: (record) => {
          return (
            `${record.owner.name || '-'}(${record.owner.mobile || '-'})`
          )
        }
      },
      {
        title: '楼层',
        width: 100,
        render: (record) => {
          return (
            record.address || '-'
          )
        }
      },
      {
        title: '状态',
        width: 70,
        dataIndex: 'status',
        key: 'status',
        render: ({ value }) => {
          return dict.deviceStatus[value]
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
      {
        title: '类型',
        dataIndex: 'referenceDevice',
        key: 'referenceDevice',
        width: 70,
        render(referenceDevice) {
          return referenceDevice.name
        }
      },
      {
        title: '操作',
        key: 'operation',
        width: 150,
        render: (text, record, index) => {
          let action = '/'
          const status = record.status.value
          const { keywords, deviceSerial } = this.search
          if(status == 9) {
            action = <Popconfirm title='确认取消锁定吗?' onConfirm={this.unlock.bind(this, record.serialNumber)}>
              <a href='javascript:void(0)'>取消锁定</a>
            </Popconfirm>
          }
          else if (status == 0 || status == 2) {
            action = <Popconfirm title='确认锁定吗?' onConfirm={this.lock.bind(this, record.serialNumber)}>
              <a href='javascript:void(0)'>锁定</a>
            </Popconfirm>
          }
          else if (status == 601 || status == 602 || status == 603
            || status == 604 || status == 605 || status == 606 || status == 607 || status == 608) {
            action = <Popconfirm title='确认取消占用吗?' onConfirm={this.unlock.bind(this, record.serialNumber)}>
              <a href='javascript:void(0)'>取消占用</a>
            </Popconfirm>
          }
          // 删除
          return (
            <span>
              {action}
              <Popconfirm title='确认删除吗?' onConfirm={this.reset.bind(this, [record.serialNumber])}>
                <a href='javascript:void(0)'>{'\u00A0'}|{'\u00A0'}删除</a>
              </Popconfirm>
              <Link to={`/crm/device/operation/${record.serialNumber}?deviceSerial=${deviceSerial || ''}&keywords=${keywords || ''}`}>{'\u00A0'}|{'\u00A0'}操作详情</Link>
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
      this.search = { ...this.search, [type]: trim(e.target.value) }
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
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'sodaDevice/list',
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
     type: 'sodaDevice/updateData',
     payload: {
       selectedRowKeys: []
     }
   })
  }
  lock = (serialNumber) => {
    this.props.dispatch({
      type: 'sodaDevice/lock',
      payload: {
        serialNumber: serialNumber,
        url: this.search
      }
    })
  }
  unlock = (serialNumber) => {
    this.props.dispatch({
      type: 'sodaDevice/unlock',
      payload: {
        serialNumber: serialNumber,
        url: this.search
      }
    })
  }
  reset = (list) => {
    this.props.dispatch({
      type: 'sodaDevice/reset',
      payload: {
        list: list,
        url: this.search
      }
    })
  }
  batchReset = () => {
    const self = this
    const { sodaDevice: { data: { objects }, selectedRowKeys } } = this.props
    const idList = selectedRowKeys
    let checkList = []
    objects.map((item) => {
      if(selectedRowKeys.indexOf(item.id) > -1) {
        checkList.push(item.serialNumber)
      }
    })
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
          type: 'sodaDevice/updateData',
          payload: {
            selectedRowKeys: []
          }
        })
      }
    })
  }
  rowSelection = () => {
    return {
      selectedRowKeys: this.props.sodaDevice.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.dispatch({
          type: 'sodaDevice/updateData',
          payload: {
            selectedRowKeys
          }
        })
      }
    }
  }
  render() {
    const { sodaDevice: { data: { objects, pagination }, selectedRowKeys }, loading  } = this.props
    const startAt = this.search.startAt ? moment(this.search.startAt, dateFormat) : null
    const endAt = this.search.endAt ? moment(this.search.endAt, dateFormat) : null
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          className={styles.button}
          onClick={this.batchReset}
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
        <InputScan
          placeholder='模块编号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'deviceSerial')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.deviceSerial}
        />
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
          scroll={{ x: 1000 }}
          rowSelection={this.rowSelection()}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'sodaDevice/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    sodaDevice: state.sodaDevice,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Device)
