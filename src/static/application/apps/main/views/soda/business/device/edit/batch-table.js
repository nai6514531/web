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
        title: '设备编号',
        dataIndex: 'serial',
        render: (serial, record) => {
          return `${serial}`
        }
      }, {
        title: '学校',
        colSpan: this.props.isAssigned ? 0 : 1,
        render: (record) => {
          let { preview: { address: addressHighlight }, serviceAddresses, isAssigned } = this.props
          let { serviceAddress: { id } } = record
          let address = _.findWhere(serviceAddresses, { id: id })
          if (!isAssigned) {
            return <span className={cx({ [styles.hightlight]: addressHighlight })}>{op(address).get('school.name') || '-'}</span>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        }
      }, {
        title: '服务地点',
        colSpan: this.props.isAssigned ? 0 : 1,
        render: (serviceAddress, record) => {
          let { preview: { address: addressHighlight }, serviceAddresses, isAssigned } = this.props
          let { serviceAddress: { id } }= record
          let address = _.findWhere(serviceAddresses, { id: id })
          if (!isAssigned) {
            return <span className={cx({ [styles.hightlight]: addressHighlight })}>{op(address).get('school.address') || '-'}</span>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        }
      },
      {
        title: '关联设备服务',
        dataIndex: 'feature',
        render: (feature) => {
          let { preview: { reference: ReferenceHighlight }, deviceTypes } = this.props
          deviceTypes = _.findWhere(deviceTypes || [], { id : op(feature).get('id') }) || {}
          let reference = _.findWhere(deviceTypes.references || [], { id : op(feature).get('reference.id') }) || {}
          return <span className={cx({ [styles.hightlight]: ReferenceHighlight })}>{op(reference).get('name') || '-'}</span>
        }
      }
    ]
  }
  initialColumns() {
    let { devices, featureType, deviceTypes, featureId } = this.props
    let { preview: { feature: isPreviewFeatureType, featureType: activeFeatureType } } = this.props
    let activeFeatureMap = _.findWhere(deviceTypes, { id: featureId }) || {}
    let columns = (op(activeFeatureMap).get('modes') || []).map((value, index) => {
      return {
        title: `服务 ${index+1}`,
        render: (record) => {
          let { preview: { price: priceHighlight, name: nameHighlight, duration: durationHighlight } } = this.props
          let mode = record.modes[`${index}`] || {}
          let name = op(mode).get('name') || '-'
          let value = op(mode).get('value')
          value = value === 0 || value ? conversionUnit(value) : '-'
          let duration = op(mode).get('duration')
          duration = duration === 0 || duration ? (duration / 60).toFixed() : '-'

          // return <div>
          //   <span className={cx({ [styles.hightlight]: nameHighlight || isHightlight })}>{name}/</span>
          //   <span className={cx({ [styles.hightlight]: priceHighlight || isHightlight })}>{value}元/</span>
          //   <span className={cx({ [styles.hightlight]: durationHighlight || isHightlight })}>{duration}分钟</span>
          // </div>
          return <div>
            <span className={cx({ [styles.hightlight]: nameHighlight })}>{name}/</span>
            <span className={cx({ [styles.hightlight]: priceHighlight })}>{value}元</span>
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
