import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { connect } from 'dva'
import { transformUrl, toQueryString } from '../../utils/'
import styles from './index.pcss'
class DataTable extends Component {
  constructor(props) {
    super(props)
    const { dataSource } = this.props
    const url = transformUrl(location.hash)
    this.state = {
      pagination: {
        total: dataSource.length,
        pageSize: Number(url.per_page) || 10,
        current: Number(url.page) || 1,
        showTotal: total => `总共 ${total} 条`,
        showSizeChanger: false,
      },
      index: -1
    }
  }
  handleTableChange = (pagination) => {
    const pager = { ...this.state.pagination }
    const { current, pageSize } = pagination
    const url = transformUrl(location.hash)
    pager.current = current
    pager.pageSize = pageSize
    this.setState({
      pagination: pager,
    })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    location.hash = toQueryString({ ...url, page: current, per_page: pageSize })
  }
  componentWillReceiveProps(nextProps) {
    const propPagination = this.props.pagination
    if(propPagination === false) {
      this.setState({
        pagination: false
      })
    }
    if(propPagination) {
      const pager = { ...this.state.pagination, ...propPagination }
      this.setState({
        pagination: pager
      })
    }
  }
  render() {
    const { columns, rowKey, dataSource, loading, scroll, common: { clickedIndex } } = this.props
    const { pagination } = this.state
    return(
      <Table
        scroll={scroll}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
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
      />
    )
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
