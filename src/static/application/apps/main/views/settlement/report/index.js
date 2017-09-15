import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Promise from 'bluebird'
import moment from 'moment'
import _ from 'underscore'
import querystring from 'querystring'

import billsService from '../../../services/bills'
import settlementService from '../../../services/settlement'
import history from '../../../utils/history'

import { Button, Modal, Form, Table, Input , DatePicker, message, Icon } from 'antd'
const confirm = Modal.confirm;
const { RangePicker } = DatePicker


import Breadcrumb from '../../../components/layout/breadcrumb/'
import styles from './index.pcss'

const PAEG_SIZE = 10

const FormItem = Form.Item

const breadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理'
  },
  {
    title: '结算报表'
  }
]

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0,
      },
      search: {
        endAt: '',
        startAt: '',
      },
      loading: false,
      searchLoading: false,
      exportLoading: false,
    }
    this.columns = [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width: 135,
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      }, {
        title: '平台收入',
        children: [{
          title: '支付宝',
          dataIndex: 'alipay',
          key: 'alipay.totalAmount',
          width: 100,
          render: (alipay) => {
            return `${(alipay.totalAmount/100).toFixed(2)}`
          }
        }, {
          title: '微信',
          dataIndex: 'wechat',
          key: 'wechat.totalAmount',
          width: 100,
          render: (wechat) => {
            return `${(wechat.totalAmount/100).toFixed(2)}`
          }
        }] 
      }, {
        title: '批量付款金额',
        children: [{
          title: '支付宝',
          dataIndex: 'alipay',
          key: 'alipay.settlement.totalAmount',
          width: 100,
          render: (alipay) => {
            return `${(alipay.settlement.totalAmount/100).toFixed(2)}`
          }
        }, {
          title: '微信',
          dataIndex: 'wechat',
          key: 'wechat.settlement.totalAmount',
          width: 100,
          render: (wechat) => {
            return `${(wechat.settlement.totalAmount/100).toFixed(2)}`
          }
        }] 
      }, {
        title: '手续费收入',
        children: [{
          title: '支付宝',
          dataIndex: 'alipay',
          key: 'alipay.settlement.cast',
          width: 100,
          render: (alipay) => {
            return `${(alipay.settlement.cast/100).toFixed(2)}`
          }
        }, {
          title: '微信',
          dataIndex: 'wechat',
          key: 'wechat.settlement.cast',
          width: 100,
          render: (wechat) => {
            return `${(wechat.settlement.cast/100).toFixed(2)}`
          }
        }, {
          title: '合计',
          width: 100,
          key: 'id',
          render: (record) => {
            let cast = record.wechat.settlement.cast + record.alipay.settlement.cast 
            return `${(cast/100).toFixed(2)}`
          }
        }] 
      }
    ]
  }
  componentDidMount () {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)

    let pagination = { ...this.state.pagination, ..._.pick(query, 'limit', 'offset') } 
    let search = { ...this.state.search, ..._.pick(query, 'endAt', 'startAt') }
    this.setState({search, pagination})

     // 未选择结束时间
    if (!search.startAt || !search.endAt) {
      return 
    }
    this.getSettlementReports(search)
  }
  getSettlementReports(options) {
    let search = { ...this.state.search, ..._.pick(options || {}, 'startAt', 'endAt') }

    search.startAt= search.startAt ? moment(search.startAt).format() : ''
    search.endAt= search.endAt ? moment(search.endAt).format() : ''
     // 未选择时间
    if (!search.startAt || !search.endAt) {
      return message.info('请选择日期')
    }

    this.setState({searchLoading: true, loading: true})

    settlementService.get(search).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        list: _.sortBy(data.objects, (data) => { return -moment(data.date).valueOf() }) || [], 
        pagination: {
          ...this.state.pagination,
          total: data.objects.length.total
        }, 
        searchLoading: false, 
        loading: false
      })
    }).catch((err) => {
      this.setState({loading: false, searchLoading: false})
      message.error(err.message || '服务器异常，刷新重试')
    })
  }

  search () {
    const { search } = this.state
    // 未选择时间
    if (!search.startAt || !search.endAt) {
      return message.info('请选择日期')
    }
    this.setState({pagination: { limit: PAEG_SIZE, offset: 0, total: 0 }})
    this.getSettlementReports()
    this.changeHistory()
  }
  onChangeDate (field, value) {
    let date = moment(value).format('YYYY-MM-DD')
    const search = { ...this.state.search, endAt: !!value ?  date: '', [field]: !!value ? date : '' }
    this.setState({search: search}); 
  }
  onStartChange (value) {
    this.onChangeDate('startAt', value);
  }
  onEndChange (value) {
    this.onChangeDate('endAt', value);
  }
  disabledStartDate (current) {
    return current && current.valueOf() > Date.now();
  }
  disabledEndDate (current) {
    const second = 31 * 24 * 60 * 60 * 1000;
    const startAt = this.state.search.startAt ? moment(this.state.search.startAt).valueOf() : '';
    if (!startAt) {
      return true;
    }
    // 结束时间和开始时间跨度　大于等于３1天
    // 获取截至结束时间
    const endDate =  Date.now() < startAt + second ? Date.now() : startAt + second
    return current && current.valueOf() < startAt || current && current.valueOf() > endDate
  }
  handleStartOpenChange (open) {
    if (!open) {
      this.setState({
        endOpen: true
      });
    }
  }
  handleEndOpenChange (open) {
    this.setState({
      endOpen: open
    });
  }
  exportSettlement() {
    const self = this
    let { search } = this.state
    if (!search.startAt || !search.endAt) {
      return message.info('请选择导出账单日期～')
    }
    confirm({
      title: '是否导出结算报表',
      content: '',
      onOk() {
        self.setState({ exportLoading: true })
        settlementService.export(self.state.search).then((res) => {
          if (res.status !== 'OK') {
            throw new Error(res.message)
          }
          window.open(res.data.url);       
          self.setState({ exportLoading: false })
        }).catch((err) => {
          self.setState({ exportLoading: false })
          message.error(err.message || '导出失败,请重试～')
          console.log(err)
        })
      },
      onCancel() {
      },
    })
  }
  changeHistory (options) {
    options = { ...this.state.search, ...this.state.pagination, ...options }
    let query = querystring.stringify(_.pick(options, 'offset', 'limit', 'endAt', 'startAt'))
    history.push(`/finance/settlement/report?${query}`)
  }
  render () {
    const self = this
    const { startAt, endAt } = this.state.search

    const pagination = {
      total: this.state.pagination.total,
      current: parseInt(this.state.pagination.offset / this.state.pagination.limit) + 1,
      pageSize: parseInt(this.state.pagination.limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {limit: pageSize, offset: offset}
        self.changeHistory(pagination)
        self.setState({pagination: { ...self.state.pagination, ...pagination }})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {offset: offset}
        self.changeHistory(pagination)
        self.setState({pagination: { ...self.state.pagination, ...pagination }})
      }
    }

    return(
      <div className={styles.view}>
        <Breadcrumb items={breadItems} />
        <div className={styles.search}>
          <DatePicker
            style={{width:120, marginBottom: 10}}
            value={!!startAt ? moment(startAt) : null}
            format="YYYY-MM-DD"
            disabledDate={this.disabledStartDate}
            placeholder="开始日期"
            onChange={this.onStartChange.bind(this)}
            onOpenChange={this.handleStartOpenChange.bind(this)}
          />
          -
          <DatePicker
            style={{width:120, marginRight:10, marginBottom: 10}}
            disabledDate={this.disabledEndDate.bind(this)}
            placeholder="结束日期"
            format="YYYY-MM-DD"
            value={!!endAt ? moment(endAt) : null}
            onChange={this.onEndChange.bind(this)}
            open={this.state.endOpen}
            onOpenChange={this.handleEndOpenChange.bind(this)}
          />
          <Button type='primary' icon='search' onClick={this.search.bind(this)} 
            loading={this.state.searchLoading} className={styles.button}>筛选</Button>
          <Button type='primary' icon='download' onClick={this.exportSettlement.bind(this)} loading={this.state.exportLoading} className={styles.button}>导出</Button>
        </div>
        <Table
          dataSource={this.state.list || []}
          rowKey={record => moment(record.date).valueOf()}
          bordered
          columns={this.columns}
          loading={this.state.loading}
          pagination={pagination}
          className={styles.table}
          scroll={{ x: 1000, y: 800 }} />
      </div>
    )
  }
}

export default App
