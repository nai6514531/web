import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker, Modal, message } from 'antd'
const { Option } = Select
import { trim } from 'lodash'
import _ from 'lodash'
import op from 'object-path'

import { InputScan, InputClear } from '../../../components/form/input'
import DataTable from '../../../components/data-table'
import Breadcrumb from '../../../components/layout/breadcrumb'
import { transformUrl, toQueryString } from '../../../utils'
import dict from '../../../utils/dict.js'
import { conversionUnit } from '../../../utils/functions'

import DEVICE from '../../../constant/device'

import styles from '../../../assets/css/search-bar.pcss'

const RangePicker = DatePicker.RangePicker
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const breadItems = [
  {
    title: '设备查询'
  }
]

class Device extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.checkList = []
    this.columns = [
      {
        title: '设备编号',
        width: 100,
        render: (record) => {

          const { keys, serials } = this.search
          return  <Link to={`/soda/device/${record.serial}?serials=${serials || ''}&keys=${keys || ''}`}>{record.serial}</Link>
        }
      },
      {
        title: '运营商名称/账号',
        width: 150,
        render: (record) => {
          let { user } = record
          return _.isEmpty(user) ? '-' : `${user.name}-${user.account}`
        }
      },
      {
        title: '服务电话',
        width: 150,
        render: (record) => {
          let { user } = record
          return _.isEmpty(user) ? '-' : `${user.mobile}`
        }
      },
      {
        title: '服务地点',
        width: 100,
        render: (record) => {
          let { serviceAddress } = record
          return op(serviceAddress).get('school.address') || '-'
        }
      },
      {
        title: '状态',
        width: 70,
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          return `${status.description}`
        }
      },
      {
        title: '关联设备',
        dataIndex: 'feature',
        width: 70,
        render: (feature) => {
          let { sodaDevice: { deviceTypes } } = this.props
          deviceTypes = _.find(deviceTypes || [], { id : op(feature).get('id') }) || {}
          let reference = _.find(deviceTypes.references || [], { id : op(feature).get('reference.id') }) || {}
          return op(reference).get('name') || '-'
        }
      },
      {
        title: '操作',
        width: 150,
        render: (text, record, index) => {
          let { id, status: { value }, serial } = record
          let isLock = !!~[...DEVICE.STATUS_IS_LOCK].indexOf(value)
          let isUsing = !!~[...DEVICE.STATUS_IS_USING].indexOf(value)
          const { keys, serials } = this.search

          return (
            <span>
              { isLock ? <Popconfirm title='确认取消锁定吗?' onConfirm={this.unlock.bind(this, serial)}>
                  <a href='javascript:void(0)'>取消锁定</a>
                </Popconfirm> :
                isUsing ? <Popconfirm title='确认取消占用吗?' onConfirm={this.unlock.bind(this, serial)}>
                  <a href='javascript:void(0)'>取消占用</a>
                </Popconfirm> :
                <Popconfirm title='确认锁定吗?' onConfirm={this.lock.bind(this, serial)}>
                  <a href='javascript:void(0)'>锁定</a>
                </Popconfirm>
              }
              {
                !record.limit.isRetrofited ? <Popconfirm title='确认回收吗?' onConfirm={this.reset.bind(this, Array(serial))}>
                  <a href='javascript:void(0)'>{'\u00A0'}|{'\u00A0'}回收</a>
                </Popconfirm> : null
              }
              <Link to={`/soda/device/operation/${serial}?serials=${serials || ''}&keys=${keys || ''}`}>{'\u00A0'}|{'\u00A0'}操作详情</Link>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    if( url.keys || url.serials ) {
      this.fetch(url)
    }
    this.deviceTypes()
  }
  changeHandler(type, e) {
    if(e.target.value) {
      this.search = { ...this.search, [type]: trim(e.target.value) }
    } else {
      delete this.search[type]
    }
  }
  searchClick() {
    const { keys, serials } = this.search
    if(!keys && !serials) {
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
  fetch(url) {
    this.props.dispatch({
      type: 'sodaDevice/list',
      payload: {
        data: url
      }
    })
  }
  deviceTypes() {
    this.props.dispatch({
      type: 'sodaDevice/deviceTypes'
    })
  }
  change(url) {
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
  lock(serial) {
    this.props.dispatch({
      type: 'sodaDevice/lock',
      payload: {
        serials: Array(serial),
        url: this.search
      }
    })
  }
  unlock(serial) {
    this.props.dispatch({
      type: 'sodaDevice/unlock',
      payload: {
        serials: Array(serial),
        url: this.search
      }
    })
  }
  reset(serialsArray) {
    this.props.dispatch({
      type: 'sodaDevice/reset',
      payload: {
        serials: serialsArray,
        url: this.search
      }
    })
  }
  batchReset() {
    const self = this
    const { sodaDevice: { data: { objects }, selectedRowKeys } } = this.props
    const idList = selectedRowKeys
    let checkList = []
    objects.map((item) => {
      if(selectedRowKeys.indexOf(item.id) > -1) {
        checkList.push(item.serial)
      }
    })
    if(!checkList.length) {
      message.info('请至少选择一个设备')
      return
    }
    Modal.confirm({
      content: `将有${checkList.length}个设备被回收，是否继续？`,
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
  rowSelection() {
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
    const { sodaDevice: { data: { objects, pagination }, selectedRowKeys }, loading } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} location={this.props.location} />
        <Button
          type='primary'
          className={styles.button}
          onClick={this.batchReset.bind(this)}
          >
          批量回收
        </Button>
        <InputClear
          placeholder='运营商名称/账号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'keys')}
          onPressEnter={this.searchClick.bind(this)}
          defaultValue={this.search.keys}
          />
        <InputScan
          placeholder='设备编号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'serials')}
          onPressEnter={this.searchClick.bind(this)}
          defaultValue={this.search.serials}
        />
        <Button
          type='primary'
          onClick={this.searchClick.bind(this)}
          className={styles.button}
          >
          筛选
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change.bind(this)}
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
