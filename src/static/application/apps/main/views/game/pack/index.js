import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, DatePicker, Input, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
import styles from './index.pcss'
import moment from 'moment'
import supplierService from '../../../services/game/supplier'
import gameService from '../../../services/game/game'
import packService from '../../../services/game/pack'

const Option = Select.Option
const confirm = Modal.confirm
const RangePicker = DatePicker.RangePicker

const breadItems = [
  {
    title: '游戏平台管理'
  },
  {
    title: '礼包管理'
  }
]
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
class Pack extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.state = {
      visible: false,
      exportUrl: '',
      games: [],
    }
    this.columns = [
      {
        title: '序号',
        key: 'index',                
        render: (text, record, index) => {
          const pagination = this.props.pack.data.pagination
          return index + pagination.from
        }
      },
      { title: '礼包名', dataIndex: 'name', key: 'name' },
      { title: '礼包ID', dataIndex: 'id', key: 'id' },
      {
        title: '有效期',
        key: 'time',
        render: (text, record, index) => {
          return (
            `${moment(record.startedAt).format('YYYY-MM-DD HH:mm:ss')}  ~  ${moment(record.endedAt).format('YYYY-MM-DD HH:mm:ss')}`
          )
        }
      }, 
      { title: '初始库存', dataIndex: 'count', key: 'count' },      
      {
        title: '上下架',
        key: 'status',        
        render: (text, record, index) => {
          return record.status ? '下架' : '上架'
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/game/pack/${record.id}`}>编辑</Link> 
            </span>
          )
        }
      }
    ]
  }
  games() {
    const self = this;
    gameService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { games: result.data.objects };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  componentDidMount() {
    this.games()
    const url = this.search
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
  searchClick = (type) => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    history.push(`${location.pathname}?${queryString}`)
    if (type == 'export') {
      this.export(this.search)
    } else {
      this.fetch(this.search)
    }
   
  }
  export = (url) => {
    const self = this;
    const data = url
    packService.export(data).then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { exportUrl: result.data.url, visible: true };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  fetch =(url) => {
    this.props.dispatch({
      type: 'pack/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
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
  hideModal = () => {
    this.setState({ visible: false })
  }
  render() {
    const { common: { search }, pack: { data: { objects, pagination } }, loading } = this.props
    const { visible, exportUrl, games } = this.state;
    pagination && (pagination.showSizeChanger = true)
    const startedAt = this.search.startedAt ? moment(this.search.startedAt, dateFormat) : null
    const endedAt = this.search.endedAt ? moment(this.search.endedAt, dateFormat) : null
    const statusList = [{status: 0, title: '上架'}, {status: 1, title: '下架'}]

    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row>
        <Select
          value={ search.gameId }
          showSearch
          allowClear
          style={{ width: 150, marginRight: 10 }}          
          placeholder="游戏名"
          optionFilterProp="children"
          onChange={this.selectHandler.bind('this','gameId')}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
         {
          games.map(value => {
            return (
              <Option value={value.id + ''} key={value.id}>{value.title}</Option>
            )
          })
        }
        </Select>
        <Select
          value={ search.status }
          allowClear
          style={{ width: 150, marginRight: 10 }}          
          placeholder="上下架"
          onChange={this.selectHandler.bind('this','status')}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
         {
          statusList.map(value => {
            return (
              <Option value={value.status + ''} key={value.status}>{value.title}</Option>
            )
          })
        }
        </Select>
        <span style={{marginBottom: '20px', marginRight: 20}}>
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
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick.bind(this, 'search')}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            筛选
          </Button>
          <Button
            type='export'
            onClick={this.searchClick.bind(this, 'export')}
            style={{marginBottom: '20px', marginRight: 20}}
            icon='download'
            >
            导出
          </Button>
        </span>
        </Row>
        <Row>
            <Link
              to={`/game/packs/orders`}>
              <Button
                type='primary'
                style={{marginBottom: '20px', marginRight: 20}}>
                排序
              </Button>
            </Link>
            <Link
              to={`/game/pack/new`}>
              <Button
                type='primary'
                style={{marginBottom: '20px', marginRight: 20}}>
                新增
              </Button>
            </Link>
        </Row>
        <DataTable
           dataSource={objects}
           columns={this.columns}
           loading={loading}
           pagination={pagination}
           change={this.change}
           scroll={{ x: 800 }}
        />
        <Modal title="导出"
          wrapClassName="playModal"
          visible={visible}
          onCancel={this.hideModal}
          >
          <form name="export" >
            <span className="form-text">确定导出礼包列表吗？</span>
            <button onClick={this.hideModal} type="button" id="cancel">取消</button>
            <a href={exportUrl} target="_blank" id="submit" download onClick={this.hideModal}>确认</a>
          </form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'pack/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    pack: state.pack,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Pack)
