import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Popconfirm, Input, Select, Row, DatePicker, Modal, message } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'

class OperationDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    const { keys, serials } = search
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      {
        title: '操作时间',
        render: (record) => {
            if(record.createdAt) {
                return (
                    moment(record.createdAt).format('YYYY-MM-DD HH:mm')
                )
            }
           return '-'
        }
      },
      { title: '操作类型', dataIndex: 'operatorType.description', key: 'operatorType.description' },
      {
        title: '说明',
        render: (record) => {
            const { operator, operatorType, toUser } = record
            let operatorText = <span style={{color: '#108ee9'}}> { operator.name || '-' } </span>
            let userText = <span style={{color: '#108ee9'}}> { toUser.name || '-' } </span>
            let description = ''
            switch (operatorType.value) {
                case 1:
                    description = <span>设备被{operatorText}删除，返回测试员账号</span>
                    break;
                case 2:
                description = <span>设备信息被{operatorText}更新</span>
                    break;
                case 3:
                    description = <span>{operatorText}将设备入库</span>
                    break;
                case 4:
                    description = <span>设备被{operatorText}分配给{userText}</span>
                    break;
                case 5:
                    description = <span>设备被{operatorText}删除</span>
                    break;
                case 6:
                    description = <span>设备信息被{operatorText}批量更新</span>
                    break;
                default:
                    break;
            }
            return(
                description
            )
        }
      }
    ]
    this.breadItems = [
        {
          title: '苏打生活'
        },
        {
          title: '设备查询',
          url: `/soda/device?serials=${serials}&keys=${keys}`
        },
        {
          title: '设备操作详情'
        }
      ]
  }
  componentDidMount() {
    const url = this.search
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'crmDevice/detail',
      payload: {
        data:  {
            ...url,
            serialNumber: this.props.match.params.id
        }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    const { crmDevice: { detail: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmDevice/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmDevice: state.crmDevice,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(OperationDetail)
