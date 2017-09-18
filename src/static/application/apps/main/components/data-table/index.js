import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { connect } from 'dva'
import { transformUrl, toQueryString } from '../../utils/'
import history from '../../utils/history.js'
import styles from './index.pcss'

class DataTable extends Component {
  constructor(props) {
    super(props)
    const { dataSource } = this.props
    const url = transformUrl(location.search)
    this.state = {
      pagination: {
        total: dataSource.length,
        // pageSize: Number(url.per_page) || 10,
        // current: Number(url.page) || 1,
        pageSize: Number(url.limit) || 10,
        current: Number(url.offset/url.limit + 1) || 1,
        showTotal: total => `总共 ${total} 条`,
        showSizeChanger: false,
      },
      index: -1
    }
  }
  componentDidMount() {
    this.unlisten = history.listen((value) => {
      const pager = { ...this.state.pagination }
      const url = transformUrl(value.search)
      pager.current = Number(url.offset/url.limit + 1)
      pager.pageSize = Number(url.limit)
      this.setState({
        pagination: pager
      })
    })
  }
  handleTableChange = (pagination) => {
    const pager = { ...this.state.pagination }
    const { current, pageSize } = pagination
    // const url = transformUrl(location.hash)
    const url = transformUrl(location.search)
    const queryString = toQueryString({ ...url, offset: (current - 1) * pageSize, limit: pageSize })
    pager.current = current
    pager.pageSize = pageSize
    this.setState({
      pagination: pager,
    })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    // location.hash = toQueryString({ ...url, page: current, per_page: pageSize })
    //     history.push(`${location.pathname}?${queryString}`)
    history.push(`${location.pathname}?${queryString}`)
    this.props.change && this.props.change(transformUrl(location.search))
  }
  render() {
    const { getBodyWrapper, columns, rowKey, dataSource, loading, scroll, common: { clickedIndex } } = this.props
    const pagination = this.props.pagination ? { ...this.state.pagination, ...this.props.pagination } : false
    return(
      <Table
        scroll={scroll}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        getBodyWrapper={getBodyWrapper}
        pagination={pagination}
        onChange={this.handleTableChange}
        rowKey= { rowKey || 'id' }
        bordered
        rowClassName={(record, index)=>  index === clickedIndex ? styles.clicked : ''}
        onRowClick={(record,index)=>{
          this.props.dispatch({
            type: 'common/updateIndex',
            payload: index
          })
        }}
        rowSelection={this.props.rowSelection}
      />
    )
  }
  componentWillUnmount() {
    this.unlisten()
  }
}

DataTable.propTypes = {
  columns: PropTypes.array,
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ])
}
function mapStateToProps(state,props) {
  return {
    common: state.common
  }
}
export default connect(mapStateToProps)(DataTable)
