import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Input, Select, Row, message, DatePicker } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import styles from './index.pcss'
import { trim } from 'lodash'
import dict from '../../../utils/dict.js'
const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '短信查询'
  }
]
const { Option } = Select
class Sms extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '接收号码', dataIndex: 'mobile', key: 'mobile' },
      { title: '内容', dataIndex: 'content',key: 'content' },
      {
        title: '接收时间',
        dataIndex: 'receivedAt',
        key: 'receivedAt',
        render: (text, record) => {
          return`${moment(record.receivedAt).utc().format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '发送时间',
        dataIndex: 'sendedAt',
        key: 'sendedAt',
        render: (text, record) => {
          return`${moment(record.sendedAt).utc().format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      { title: '错误码', dataIndex: 'code', key: 'code' },
      {
        title: '短信状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          if(record.status == 2) {
            return(
              <Link target='_blank' to={`https://doc.alidayu.com/doc2/detail.htm?spm=0.0.0.0.RXMbE8&treeId=136&articleId=104495&docType=1`}>{ dict.sms[record.status] || '-' }</Link>
            )
          }
          return(
            dict[record.status] || '-'
          )
        }
      },
    ]
  }
  componentDidMount() {
    const url = this.search
    const { mobile, date, limit, offset } = url
    if( !mobile && !date ) {
      // message.info('请选择筛选条件')
      return
    }
    this.fetch(url)
  }
  dateChange = (field, value) => {
    if(value) {
      this.search = { ...this.search, date: value }
    } else {
      delete this.search.date
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
    const { mobile, date, limit, offset } = this.search
    if( !date || !mobile ) {
      message.info('请选择筛选条件')
      return
    }
    if( mobile && mobile.length !== 11 ) {
      message.info('请输入正确的手机号')
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
      type: 'crmSms/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  disabledDate = (current) => {
    if(current) {
      return current.valueOf() > Date.now() || current.valueOf() < Date.now() - 31 * 24 * 60 * 60 * 1000
    }
  }
  render() {
    const { crmSms: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <span className={styles.input}>
          <DatePicker
            onChange={this.dateChange}
            disabledDate={this.disabledDate}
            defaultValue={ this.search.date ? moment(this.search.date, 'YYYY-MM-DD') : null }/>
          </span>
          <Input
            placeholder='手机号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'mobile')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.mobile}
          />
          <span className={styles['button-wrap']}>
            <Button
              type='primary'
              onClick={this.searchClick}
              className={styles.button}
              icon='search'
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
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmSms/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmSms: state.crmSms,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Sms)
