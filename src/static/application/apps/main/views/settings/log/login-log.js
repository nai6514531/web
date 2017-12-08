import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Input, Select, Row, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import history from '../../../utils/history.js'
import styles from './index.pcss'
import { trim } from 'lodash'
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '登录记录'
  }
]
const { Option } = Select
class LoginLog extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '用户id', dataIndex: 'userId', key: 'userId' },
      { title: '用户名', dataIndex: 'userName', key: 'userName' },
      { title: '账号', dataIndex: 'userAccount',key: 'userAccount' },
      { title: '省', dataIndex: 'provinceName',key: 'provinceName' },
      { title: '市', dataIndex: 'cityName',key: 'cityName' },
      {
        title: '登录时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text, record) => {
          return`${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch(this.search)
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: trim(e.target.value) }
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
  fetch = (url) => {
    this.props.dispatch({
      type: 'log/loginList',
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
    const { log: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
          <Input
            placeholder='用户id'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'userId')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.userId}
          />
          <Input
            placeholder='用户名'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'userName')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.userName}
          />
          <Input
            placeholder='账号'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'userAccount')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.userAccount}
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
    this.props.dispatch({ type: 'log/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    log: state.log,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(LoginLog)
