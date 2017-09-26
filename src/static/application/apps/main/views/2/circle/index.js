import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button, AutoComplete, Message } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
import styles from './index.pcss'

const Option = Select.Option
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '城市管理'
  }
]

class Circle extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      {
        title: '序号',
        dataIndex: 'order',
        key: 'order',
      },
      {
        title: '城市名',
        dataIndex: 'cityName',
        key: 'cityName',
      },
      {
        title: '激活学校数量',
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
              <Link to={`/2/topic?cityId=${record.cityId}`}>商品管理</Link>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    if( !url.provinceId ) {
      delete url.provinceId
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.props.dispatch({
      type: 'circle/summary'
    })
    this.props.dispatch({
      type: 'circle/provinceList'
    })
    this.fetch(url)
  }
  changeHandler = (type, value) => {
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    this.search = { ...this.search, [type]: value }
  }
  handleSelect = () => {
    this.props.dispatch({
      type: 'circle/updateData',
      payload: {
        disabled: false
      }
    })
  }
  handleSearch = (filterKey) => {
    const { provinceData, clonedProvinceData } = this.props.circle
    const result = clonedProvinceData.filter(function( value, index ){
        return new RegExp( filterKey , 'img' ).test( value.name );
    })
    this.props.dispatch({
      type: 'circle/updateData',
      payload: {
        disabled: true
      }
    })
    this.props.dispatch({
      type: 'circle/updateData',
      payload: {
        provinceData: result
      }
    })
    if(!filterKey) {
      this.props.dispatch({
        type: 'circle/updateData',
        payload: {
          provinceData: clonedProvinceData,
          disabled: false
        }
      })
    }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.dispatch({
      type: 'circle/updateData',
      payload: {
        provinceData: this.props.circle.clonedProvinceData
      }
    })
    this.fetch(this.search)
    history.push(`${location.pathname}?${queryString}`)
  }
  change = (url) => {
   this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'circle/list',
      payload: {
        data: url
      }
    })
  }
  render() {
    const { circle: { summary, data: { objects, pagination }, provinceData, clonedProvinceData, disabled }, loading, common: { search }  } = this.props
    const dataSource = this.props.circle.provinceData.map(value => {
      return <Option value={value.code + ''} key={value.id}>{value.name}</Option>
    })
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <AutoComplete
          placeholder='省'
          value={search.provinceId}
          allowClear
          className={styles.input}
          dataSource={dataSource}
          onSearch={this.handleSearch}
          onSelect={this.handleSelect}
          onChange={this.changeHandler.bind('this','provinceId')}>
        </AutoComplete>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            disabled={disabled}
            >
            筛选
          </Button>
        </span>
        {
          summary ? <div className={styles.summary}>{`共计有${summary.circleCount}个城市有用户在使用，激活用户总数量为${summary.usersCount}，共发布了${summary.topicsCount}件商品`}</div> : ''
        }
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          rowKey="order"
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'circle/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
    this.props.dispatch({ type: 'common/resetIndex' })
  }
}
function mapStateToProps(state,props) {
  return {
    circle: state.circle,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Circle)
