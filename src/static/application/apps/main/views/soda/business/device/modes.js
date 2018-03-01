import React, { Component } from 'react'
import { Table } from 'antd'

import { conversionUnit } from '../../../../utils/functions'

import styles from './index.pcss'

class Modes extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      {
        title: '服务名',
        dataIndex: 'name',
        key: 'name',
        render: (name) => {
          return <span>{name}</span>
        }
      },
      {
        title: '价格(元)',
        dataIndex: 'value',
        key: 'value',
        render: (value) => {
          return <span>{conversionUnit(value)}</span>
        }
      },
      {
        title: '时间(分钟)',
        dataIndex: 'duration',
        key: 'duration',
        render: (duration) => {
          return <span>{duration/1000}</span>
        }
      }
    ]
  }

  render() {
    let { modes } = this.props
    if (_.isEmpty(modes)) {
      return <div style={{ textAlign: 'center' }}>该设备暂无服务模式信息</div>
    }
    return (<Table
      className={styles.tableExpanded}
      columns={this.columns}
      rowKey={record => record.id}
      dataSource={modes}
      pagination={false}
    />)
  }
}

export default Modes
