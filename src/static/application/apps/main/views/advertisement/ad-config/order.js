import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import styles from './index.pcss'
const RangePicker = DatePicker.RangePicker
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const breadItems = [
  {
    title: '业务配置系统'
  },
  {
    title: '广告配置'
  },
  {
    title: '广告排序'
  }
]
const { Option } = Select

class AdOrder extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.hash)
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '广告名', dataIndex: 'name',key: 'name' },
      { title: '广告标题', dataIndex: 'title', key: 'title' },
      { title: '活动链接', dataIndex: 'url',key: 'url' },
      {
        title: '显示时间',
        render: (text, record) => {
          return (
            `${moment(record.startedAt).format('YYYY-MM-DD HH:mm')}  ~  ${moment(record.endedAt).format('YYYY-MM-DD HH:mm')}`
          )
        }
      },
      { title: '显示状态',
        render: (text, record) => {
          return (
            record.displayStrategy === 1 ? '全部显示' : '按尾号显示'
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)'>{'\u00A0'}预览</a>
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
      type: 'adConfig/list',
      payload: {
        data: url,
        order: true
      }
    })
    this.props.dispatch({
      type: 'adConfig/appList'
    })
    if(url.app_id) {
      this.props.dispatch({
        type: 'adConfig/postionList',
        payload: {
          data: {
            app_id: url.app_id
          }
        }
      })
    }
  }
  selectHandler = (type, value) => {
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if( type === 'app_id' ) {
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            location_id: undefined
          }
        }
      })
      this.props.dispatch({
        type: 'adConfig/postionList',
        payload: {
          data: {
            app_id: value
          }
        }
      })
      delete this.search.location_id
    }
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
    const { common: { search }, adConfig: { data: { objects, pagination }, appData, postionData }, loading  } = this.props
    const started_at = this.search.started_at ? moment(this.search.started_at, dateFormat) : null
    const ended_at = this.search.ended_at ? moment(this.search.ended_at, dateFormat) : null
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row className={styles['input-wrap']}>
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
          <Select
            value={ search.location_id }
            allowClear
            className={styles.input}
            placeholder='广告位'
            onChange={this.selectHandler.bind('this','location_id')}>
              {
                postionData.map(value => {
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
              className={styles.button}
              >
              筛选
            </Button>
            <Button
              type='primary'
              className={styles.button}
              >
              <Link to={`/advertisement/order`}>同步到现网</Link>
            </Button>
          </span>
        </Row>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          scroll={{ x: 700 }}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adConfig/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    adConfig: state.adConfig,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(AdOrder)
