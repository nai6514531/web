import React, { Component } from 'react'
import _ from 'underscore'
import op from 'object-path'
import cx from 'classnames'
import { Table } from 'antd'
import clone from 'clone'

import { conversionUnit } from '../../../../../utils/functions'

import styles from '../index.pcss'

class BatchTable extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        render: (id, record) => {
          return `${id}`
        }
      }, {
        title: '编号',
        dataIndex: 'serial',
        render: (serial, record) => {
          return `${serial}`
        }
      }, {
        title: '学校',
        render: (record) => {
          let { preview: { address: addressHighlight } } = this.props
          let { serviceAddress : { school: { name }} } = record
          return <span className={cx({ [styles.hightlight]: addressHighlight })}>{name || '-'}</span>
        }
      }, {
        title: '服务地点',
        render: (serviceAddress, record) => {
          let { preview: { address: addressHighlight } } = this.props
          let { serviceAddress : { school: { address }} } = record
          return <span className={cx({ [styles.hightlight]: addressHighlight })}>{address || '-'}</span>
        }
      },
      {
        title: '关联设备类型',
        dataIndex: 'feature',
        render: (feature) => {
          let { preview: { feature: featureTypeHighlight } } = this.props
          return <span className={cx({ [styles.hightlight]: featureTypeHighlight })}>{op(feature).get('name') || '-'}</span>
        }
      }
    ]
  }
  initialColumns() {
    let { devices, featureType, deviceTypes } = this.props
    let { preview: { feature: isPreviewFeatureType, featureType: activeFeatureType } } = this.props
    let type = isPreviewFeatureType ? activeFeatureType : featureType
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: type }) || {}
    let isHightlight = isPreviewFeatureType && featureType !== activeFeatureType
    let columns = (activeFeatureTypeMap.pulse || []).map((pulse, index) => {
      return {
        title: `服务 ${index+1}`,
        render: (record) => {
          let modesGroupByPulseId = _.indexBy(record.modes, (mode) => {
            return mode.pulse.id
          })
          let { preview: { price: priceHighlight, name: nameHighlight, duration: durationHighlight } } = this.props
          let mode = record.modes[`${index}`] || {}
          let name = op(mode).get('name') || '-'
          let value = op(mode).get('value')
          value = value === 0 || value ? conversionUnit(value) : '-'
          let duration = op(mode).get('duration')
          duration = duration === 0 || duration ? duration / 1000 : '-'

          return <div>
            <span className={cx({ [styles.hightlight]: nameHighlight || isHightlight })}>{name}/</span>
            <span className={cx({ [styles.hightlight]: priceHighlight || isHightlight })}>{value}元/</span>
            <span className={cx({ [styles.hightlight]: durationHighlight || isHightlight })}>{duration}分钟</span>
          </div>
        }
      }
    }) 
    return this.columns.concat(columns) 
  }
  render() {
    let { devices } = this.props
    let columns = this.initialColumns()

    return (<Table
      bordered
      scroll={{ x: 980 }}
      style={{ marginTop: 16 }}
      columns={columns}
      pagination={false}
      rowKey={record => record.id}
      dataSource={devices}
    />)
  }
}

export default BatchTable
