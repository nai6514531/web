import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from './index.pcss'

const Option = Select.Option
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '圈子管理'
  }
]
class Circle extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.hash)
    delete search.page
    delete search.per_page
    this.search = search
    this.columns = [
      {
        title: '序号',
        dataIndex: 'order',
        key: 'order',
      },
      {
        title: '圈子名',
        dataIndex: 'cityName',
        key: 'cityName',
      },
      {
        title: '拥有学校数量',
        dataIndex: 'schoolCount',
        key: 'schoolCount',
      },
      {
        title: '激活用户数量',
        dataIndex: 'userCount',
        key: 'userCount',
      },
      {
        title: '发布商品数量',
        dataIndex: 'topicCount',
        key: 'topicCount',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/2/topic#city_id=${record.cityId}`}>商品管理</Link>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'circle/list',
      payload: {
        data: url
      }
    })
  }
  changeHandler =  (type, value) => {
    if(!value) {
      value = ''
    }
    this.search = { ...this.search, [type]: value }
  }
  searchClick = () => {
    location.hash = toQueryString({ ...this.search })
  }
  render() {
    const { circle: { data: { objects, pagination } }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          placeholder='省'
          defaultValue={this.search.province_id}
          allowClear
          className={styles.input}
          onChange={this.changeHandler.bind('this','province_id')}>
            <Option value="1">上海</Option>
            <Option value="2">内蒙古</Option>
            <Option value="3">广东</Option>
            <Option value="4">福建</Option>
        </Select>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            查询
          </Button>
        </span>
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          rowKey="order"
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'circle/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    circle: state.circle,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Circle)

