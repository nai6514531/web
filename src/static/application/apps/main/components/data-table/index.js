import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { transformUrl } from '../../utils/'

class DataTable extends Component {
  constructor(props) {
    super(props)
    const { dataSource } = this.props
    const url = transformUrl(location.hash)
    this.state = {
      pagination: {
        total: dataSource.length,
        pageSize: Number(url.pageSize) || 10,
        current: Number(url.page) || 1,
        showTotal: total => `总共 ${total} 条`,
        showSizeChanger: false
      }
    }
  }
  componentWillMount() {
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
  handleTableChange = (pagination) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    pager.pageSize = pagination.pageSize
    this.setState({
      pagination: pager,
    })
    location.hash = `page=${pagination.current}&pageSize=${pagination.pageSize}`
  }
  render() {
    const { columns, dataSource, loading } = this.props
    const { pagination } = this.state
    return(
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        onChange={this.handleTableChange}
        bordered
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

export default DataTable
