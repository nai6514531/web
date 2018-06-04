import { Button, Select, message, Input } from 'antd';
import { transformUrl, toQueryString } from '../../../utils/';
import { render } from 'react-dom';
import { connect } from 'dva';
import { trim } from 'lodash';
import React, { Component } from 'react';
import Breadcrumb from '../../../components/layout/breadcrumb/';
import DataTable from '../../../components/data-table/';
import { InputClear } from '../../../components/form/input';
import styles from '../../../assets/css/search-bar.pcss';
import moment from 'moment';

const { Option } = Select
class WalletLog extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '用户查询'
      },
      {
        title: '提现查询'
      }
    ]
    this.columns = [
      {
        title: '手机号',
        dataIndex: 'mobile',
        key: 'mobile'
      },
      {
        title: '业务',
        dataIndex: 'title',
        key: 'title'
      },
      {
        title: '金额',
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => {
          return record.value / 100
        }
      },
      {
        title: '操作人',
        dataIndex: 'userName',
        key: 'userName'
      },
      {
        title: '时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt) => {
          return moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    if ( url.mobile ) {
      this.fetch(url.mobile)
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
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
  changeHandler = (type, e) => {
    let val = e.target.value || ''

    if (val) {
      this.search = { ...this.search, [type]: trim(val) }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { mobile, limit, offset } = this.search
    if( !mobile ) {
      message.info('请输入筛选条件')
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
  fetch = (mobile) => {
    this.props.dispatch({
      type: 'walletlog/list',
      payload: {
        data: this.search
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    const { walletlog: { data: { objects, pagination } }, loading } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <InputClear
          placeholder='请输入用户手机号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'mobile')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.mobile}
        />
        <Button
          type='primary'
          onClick={this.searchClick}
          >
          查询
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 600 }}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'walletlog/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  } 
}

function mapStateToProps(state,props) {
  return {
    common: state.common,
    walletlog: state.walletlog,
    loading: state.loading.global,
    ...props
  }
}

export default connect(mapStateToProps)(WalletLog)