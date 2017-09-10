import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker, Modal } from 'antd'
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
    title: '业务配置系统'
  },
  {
    title: '广告配置'
  }
]
const { Option } = Select

class AdConfig extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '所属业务', dataIndex: 'appName',key: 'appName' },
      { title: '广告位', dataIndex: 'locationName', key: 'locationName', width: 100 },
      { title: '广告名', dataIndex: 'name',key: 'name', width: 100 },
      { title: '广告标题', dataIndex: 'title', key: 'title', width: 100 },
      { title: '活动链接', dataIndex: 'url',key: 'url', width: 100 },
      {
        title: '展示时间',
        render: (text, record) => {
          return (
            `${moment(record.startedAt).format('YYYY-MM-DD HH:mm:ss')}  ~  ${moment(record.endedAt).format('YYYY-MM-DD HH:mm:ss')}`
          )
        }
      },
      { title: '展示状态',
        width: 100,
        render: (text, record) => {
          return (
            record.displayStrategy === 1 ? '全部显示' : ` 用户号码尾号(${record.displayParams})`
          )
        }
      },
      {
        title: '上下架',
        render: (text, record) => {
          return (
            record.status === 1 ? '下架' : '上架'
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/advertisement/config/${record.id}`}>编辑</Link> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a> |
              </Popconfirm>
              <a
                href='javascript:void(0)'
                onClick={() => {
                  this.props.dispatch({
                    type: 'adConfig/showModal',
                    payload: {
                      previewImage: record.image
                    }
                  })
                }}
                >
                {'\u00A0'}预览
              </a>
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
    this.props.dispatch({ type: 'adConfig/appList' })
    if(url.appId) {
      this.props.dispatch({
        type: 'adConfig/postionList',
        payload: {
          data: {
            appId: url.appId
          }
        }
      })
    }
    this.fetch(url)
  }
  delete = (id) => {
    const url = this.search
    this.props.dispatch({
      type: 'adConfig/delete',
      payload: {
        id: id,
        data: url
      }
    })
  }
  timeChange = (value, dateString) => {
    let [ startedAt, endedAt ] = dateString
    if(startedAt && endedAt) {
      startedAt = moment(startedAt).format()
      endedAt = moment(endedAt).format()
      this.search = { ...this.search, startedAt, endedAt }
    } else {
      delete this.search.startedAt
      delete this.search.endedAt
    }
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: e.target.value }
    } else {
      delete this.search[type]
    }
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
    if(type === 'appId') {
      delete this.search.locationId
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            locationId: undefined
          }
        }
      })
      this.props.dispatch({
        type: 'adConfig/postionList',
        payload: {
          data: {
            appId: value
          }
        }
      })
    }
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
  hide = () => {
    this.props.dispatch({
      type: 'adConfig/hideModal',
    })
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'adConfig/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
   this.fetch(url)
  }
  render() {
    const { common: { search }, adConfig: { data: { objects, pagination }, appData, postionData, previewImage, visible, key }, loading  } = this.props
    const startedAt = this.search.startedAt ? moment(this.search.startedAt, dateFormat) : null
    const endedAt = this.search.endedAt ? moment(this.search.endedAt, dateFormat) : null
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row>
          <Select
            value={ search.appId }
            allowClear
            className={styles.input}
            placeholder='所属业务'
            onChange={this.selectHandler.bind('this','appId')}>
              {
                appData.map(value => {
                  return (
                    <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                  )
                })
              }
          </Select>
          <Select
            value={ search.locationId }
            allowClear
            className={styles.input}
            placeholder='广告位'
            onChange={this.selectHandler.bind('this','locationId')}>
              {
                postionData.map(value => {
                  return (
                    <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                  )
                })
              }
          </Select>
          <Input
            placeholder='广告名'
            className={styles.input}
            onChange={this.changeHandler.bind(this, 'title')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.title}
           />
          <span className={styles.input}>
          <RangePicker
            showTime
            defaultValue={[startedAt,endedAt]}
            format={dateFormat}
            onChange={this.timeChange}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }} />
          </span>
        </Row>
        <Row className={styles['input-wrap']}>
          <Select
            defaultValue={this.search.display}
            allowClear
            className={styles.input}
            placeholder='展示状态'
            onChange={this.selectHandler.bind('this','display')}>
              <Option value={'1'}>{'全部显示'}</Option>
              <Option value={'2'}>{'按尾号显示'}</Option>
          </Select>
          <Select
            defaultValue={this.search.status}
            allowClear
            className={styles.input}
            placeholder='上下架'
            onChange={this.selectHandler.bind('this','status')}>
              <Option value={'2'}>{'上架'}</Option>
              <Option value={'1'}>{'下架'}</Option>
          </Select>
          <span className={styles['button-wrap']}>
            <Button
              type='primary'
              onClick={this.searchClick}
              className={styles.button}
              >
              筛选
            </Button>
            <Link to={`/advertisement/config/order`}>
              <Button
                type='primary'
                className={styles.button}
                >
               排序
              </Button>
            </Link>
            <Link
              to={`/advertisement/config/new`}>
              <Button
                type='primary'
                className={styles.button}>
                添加广告
              </Button>
            </Link>
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
        <Modal key={key} visible={visible} footer={null} onCancel={this.hide}>
          <img alt='图片' style={{ padding: 15, width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adConfig/clear'})
    this.props.dispatch({ type: 'common/resetSearch'})
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
export default connect(mapStateToProps)(AdConfig)
