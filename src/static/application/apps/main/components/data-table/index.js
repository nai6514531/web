import React, { Component } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { connect } from 'dva'
import { transformUrl, toQueryString } from '../../utils/'
import { withRouter } from 'react-router-dom'
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
    this.unlisten = this.props.history.listen((value) => {
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
    let handlerResult = true
    const { current, pageSize } = pagination
    const url = transformUrl(location.search)
    const queryString = toQueryString({ ...url, offset: (current - 1) * pageSize, limit: pageSize })

    pager.current = current
    pager.pageSize = pageSize

    if(this.props.change) {
      handlerResult = this.props.change(transformUrl(`?${queryString}`))
    }

    if(handlerResult !== 'NOTRENDER') {
      this.setState({
        pagination: pager,
      })
      this.props.dispatch({
        type: 'common/resetIndex'
      })
      this.props.history.push(`${location.pathname}?${queryString}`)
    }
  }
  render() {
    const { getBodyWrapper, rowClassName, columns, rowKey, dataSource, loading, scroll, common: { clickedIndex } } = this.props
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
        rowClassName={
          (record, index) => {
            if(rowClassName) {
              rowClassName(record, index)
            } else {
              const className = index === clickedIndex ? styles.clicked : ''
              return className
            }
          }
        }
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
export default connect(mapStateToProps)(withRouter(DataTable))
