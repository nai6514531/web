import React, { Component }from 'react'
import _ from 'underscore'
import moment from 'moment'
import querystring from 'querystring'
import op from 'object-path'
import { Link } from 'react-router-dom'

import { Affix, Button, Table, Icon, Popconfirm, Select, DatePicker, message, Modal } from 'antd'
const Option = Select.Option
const confirm = Modal.confirm

import { InputClear } from '../../../../components/form/input'
import Breadcrumb from '../../../../components/layout/breadcrumb'
import { Element } from '../../../../components/element'

import DailyBillsService from '../../../../services/soda-manager/daily-bills'
import DrinkingDailyBillsService from '../../../../services/soda-manager/drinking-daily-bills'
import { conversionUnit } from '../../../../utils/functions'

import BILL from '../../../../constant/bill'
import CASH_ACCOUNT from '../../../../constant/cash-account'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '每日账单'
  }
]

@Element()
class App extends Component {
  constructor(props) {
    super(props)
    let { isVisible } = this.props
    this.state = {
      bills: [],
      loading: false,
      searchLoading: false,
      endOpen: false,
      search: {
        type: '',
        status: '',
        keys: '',
        startAt: moment(moment(new Date()).format("YYYY-MM-DD")).subtract(30, 'days').format(),
        endAt: moment(moment(new Date()).format("YYYY-MM-DD")).format(),
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      }
    }
    this.columns = [
      {
        title: '账单号',
        dataIndex: 'id',
      }, {
        title: '运营商',
        dataIndex: 'user',
        render: (user) => {
          return `${user.name}`
        }
      }, {
        title: '金额',
        dataIndex: 'totalAmount',
        render: (value) => {
          return <p className={styles.amount}>{conversionUnit(value)}</p>
        }
      }, {
        title: '收款方式',
        render: (record) => {
          let { cashAccount: { type } } = record
          return CASH_ACCOUNT.TYPE[type]
        }
      }, {
        title: '账期',
        dataIndex: 'billAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      }, {
        title: '账户信息',
        render: (record) => {
          let { cashAccount: { type, realName, account, bankName }, user: { mobile } } = record

          if (!!~[CASH_ACCOUNT.TYPE_IS_ALIPAY].indexOf(type)) {
            return _.without([`${realName}`, `账号:${account || '-'}`, `手机:${mobile || '-'}`], '').join(' | ')
          }
          if (!!~[CASH_ACCOUNT.TYPE_IS_WECHAT].indexOf(type)) {
            return realName || '-'
          }
          if (!!~[CASH_ACCOUNT.TYPE_IS_BANK].indexOf(type)) {
            return _.without([`户名:${realName}`, `${bankName}`, `${account}`, `${mobile}`], '').join(' | ')
          }
          return '-'
        }
      }, {
        title: '订单量',
        dataIndex: 'count'
      }, {
        title: '状态',
        colSpan: isVisible('DAILY_BILL:TEXT:SHOW_STATUS') ? 1 : 0,
        dataIndex: 'status',
        render: (status, record) => {
          if (isVisible('DAILY_BILL:TEXT:SHOW_STATUS')) {
            let label
            switch (status) {
              case BILL.SETTLEMENT_STATUS_IS_DEFAULT:
                label = <span>未申请结算</span>
                break;
              case BILL.SETTLEMENT_STATUS_IS_WAITING:
                label = <span><i className={styles.waiting}></i>等待结算</span>
                break;
              case BILL.SETTLEMENT_STATUS_IS_SUCCESS:
                label = <span><i className={styles.success}></i>结算成功</span>
                break;
              case BILL.SETTLEMENT_STATUS_IS_PAYING:
                label = <span><i className={styles.paying}></i>结算中</span>
                break;
              case BILL.SETTLEMENT_STATUS_IS_FAIL:
                label = <span><i className={styles.fail}></i>结算失败</span>
                break;
              default:
                label = <span>-</span>
                break;
            }
            return {
              children: <p className={styles.status}>{label}</p>
            }
          } else {
            return {
              props: {
                colSpan: 0
              }
            }
          }
        }
      }, {
        title: '操作',
        dataIndex: 'id',
        key: 'method',
        render: (id, record) => {
          let pathname = op(location).get('pathname').split('/')[1]
          return <Link to={`/${pathname}/business/daily-bill/${record.id}`}>明细</Link>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)

    let search = _.pick(query, 'status', 'endAt', 'startAt', 'keys', 'type')
    let pagination = _.pick(query, 'limit', 'offset')
    this.list({search, pagination})
  }
  list({...options}) {
    let { location: { pathname } } = this.props
    let isDringking = !!~pathname.indexOf('soda-drinking')
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = {...this.state.search, ...search}
    pagination = {...this.state.pagination, ...pagination}
    this.setState({ searchLoading: true, loading: true, search, pagination })

    if (isDringking) {
      DrinkingDailyBillsService.list({...search, ..._.pick(pagination, 'limit', 'offset')}).then((res) => {
        if (res.status !== 'OK') {
          throw new Error(res.message)
        }
        let data = res.data
        this.setState({
          bills: data.objects || [],
          pagination: {
            ...pagination,
            total: data.pagination.total
          },
          searchLoading: false,
          loading: false
        })
      }).catch((err) => {
        this.setState({ bills: [], loading: false, searchLoading: false })
        message.error(err.message || '服务器异常，刷新重试')
      })
      return
    }
    DailyBillsService.list({...search, ..._.pick(pagination, 'limit', 'offset')}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        bills: data.objects || [],
        pagination: {
          ...pagination,
          total: data.pagination.total
        },
        searchLoading: false,
        loading: false
      })
    }).catch((err) => {
      this.setState({ bills: [], loading: false, searchLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { search } = this.state
    let pagination = { offset: 0 }
    if (!!search.startAt && !search.endAt) {
      return message.info('请选择结束日期')
    }
    this.changeHistory(pagination)
    this.list({pagination})
  }
  onChangeDate (field, value) {
    const date = moment(moment(value).format('YYYY-MM-DD')).format()
    //　更新开始时间，则触发结束时间,保持与其一致
    const search = { ...this.state.search, endAt: !!value ? date : '', [field]: !!value ? date : '' }
    this.setState({ search: search });
  }
  onStartChange (value) {
    this.onChangeDate('startAt', value);
  }
  onEndChange (value) {
    this.onChangeDate('endAt', value);
  }
  disabledStartDate(current) {
    return current && current.valueOf() > Date.now();
  }
  disabledEndDate (current) {
    const second = 30 * 24 * 60 * 60 * 1000;
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
  handleEndOpenChange(open) {
    this.setState({
      endOpen: open
    })
  }
  changeKeys (e) {
    const val = e.target.value || ''
    this.setState({ search: {...this.state.search, keys: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  changeHistory ({...options}) {
    let query = _.pick({ ...this.state.search, ...this.state.pagination, ...options }, 'offset', 'limit', 'status', 'endAt', 'startAt', 'keys', 'type')
    let pathname = op(location).get('pathname').split('/')[1]
    this.props.history.push(`/${pathname}/business/daily-bill?${querystring.stringify(query)}`)
  }
  pagination () {
    let self = this
    let { pagination: { total, offset, limit } } = this.state
    return {
      total: total,
      current: parseInt(offset / limit) + 1,
      pageSize: parseInt(limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (data) {
        return <span>总计 {data} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { limit: pageSize, offset: offset }
    		self.changeHistory(pagination)
        self.list({pagination})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { offset: offset }
    		self.changeHistory(pagination)
        self.list({pagination})
      }
    }
  }
  render() {
    let { bills, searchLoading, search: { type, status, keys, startAt, endAt, dateType } } = this.state
    let pagination = this.pagination()

    return (<section className={styles.view}>
      <Breadcrumb items={breadItems} />
      <div>
        <Select
          value={type}
          style={{ width: 150, marginRight: 10, marginBottom: 10 }}
          onChange={(value) => { this.setState({ search: { ...this.state.search, type: value } }) }}>
          <Option value=''>请选择收款方式</Option>
          <Option value='1'>支付宝</Option>
          <Option value='2'>微信</Option>
          <Option value='3'>银行</Option>
        </Select>
        {
          this.props.isVisible("DAILY_BILL:SELECT:STATUS") ? <Select
            value={status}
            style={{ width: 150, marginRight: 10, marginBottom: 10 }}
            onChange={(value) => { this.setState({ search: { ...this.state.search, status: value } }) }}>
            <Option value=''>请选择结算状态</Option>
            <Option value='0'>未申请结算</Option>
            <Option value='1'>等待结算</Option>
            <Option value='2'>结算成功</Option>
            <Option value='3'>结算中</Option>
            <Option value='4'>结算失败</Option>
          </Select> : null
        }
        <DatePicker
          placeholder='开始日期'
          format="YYYY-MM-DD"
          style={{　width: 120, marginRight: 5, marginBottom: 10, verticalAlign: 'bottom'　}}
          value={!!startAt ? moment(startAt) : null}
          disabledDate={this.disabledStartDate.bind(this)}
          onChange={this.onStartChange.bind(this)}
          onOpenChange={this.handleStartOpenChange.bind(this)}
        />
        -
        <DatePicker
          placeholder='结束日期'
          format='YYYY-MM-DD'
          style={{　width: 120, marginLeft: 5, marginRight: 10, marginBottom: 10, verticalAlign: 'bottom'　}}
          value={!!endAt ? moment(endAt) : null}
          open={this.state.endOpen}
          disabledDate={this.disabledEndDate.bind(this)}
          onChange={this.onEndChange.bind(this)}
          onOpenChange={this.handleEndOpenChange.bind(this)}
        />
        { 
          this.props.isVisible("DAILY_BILL:INPUT:SEARCH_KEYS") ? <InputClear
          value={keys}
          style={{ width: 190, marginRight: 10, marginBottom: 10 }}
          placeholder='输入运营商名称或银行名称'
          onChange={this.changeKeys.bind(this)}
          onPressEnter={this.search.bind(this)} /> : null
        }
        <Button type='primary' style={{ marginBottom: 10 }} loading={searchLoading} icon='search' onClick={this.search.bind(this)}>筛选</Button>
      </div>
      <Table
        style= {{ marginTop: 16 }}
        scroll={{ x: 900 }}
        dataSource={bills}
        columns={this.columns}
        pagination={pagination}
        rowKey={record => record.id}
        loading={this.state.loading}
       />
    </section>)
  }
}

export default App
