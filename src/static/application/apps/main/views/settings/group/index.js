import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Tag, Table } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import styles from '../../../assets/css/search-bar.pcss'
import { groupBy } from 'lodash'
import dict from '../../../utils/dict'
import './index.css'

const FormItem = Form.Item
const formItemLayout = {
   labelCol: {
     xs: { span: 24 },
     sm: { span: 6 },
   },
   wrapperCol: {
     xs: { span: 24 },
     sm: { span: 14 },
   }
}
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '权限分组'
  }
]

class Group extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '菜单名', dataIndex: 'name',key: 'name',className: 'td-left', width: 300 },
      {
        title: '权限名',
        className: 'td-left',
        render: (text, record, index) => {
          if(!record.permission) {
            return (
              <span>/</span>
            )
          }
          const data = groupBy(record.permission,'type')

          const element = data[dict.permission.type.element]
          const menu = data[dict.permission.type.menu]
          const api = data[dict.permission.type.api]
          return (
            <span>
              <div>
               {
                 element && element.map(value => <Tag style={{ margin: '3px' }} color={'#f50'} key={record.id * value.id}>{ value.name }</Tag> )
               }
              </div>
              <div>
               {
                 menu && menu.map(value => <Tag style={{ margin: '3px' }} color={'#87d068'} key={record.id * value.id}>{ value.name }</Tag> )
               }
              </div>
              <div>
               {
                 api && api.map(value => <Tag style={{ margin: '3px' }} color={'#2db7f5'} key={record.id * value.id}>{ value.name }</Tag> )
               }
              </div>
            </span>
          )
        }
      },
      {
        title: '操作',
        width: 100,
        render: (text, record, index) => {
          if(record.id === -1) {
            return (
              <span>/</span>
            )
          }
          return (
            <Link
              to={`/admin/settings/permission-group/${record.id}?name=${record.name}`}>
               <Button type="primary" icon="plus" />
            </Link>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'group/menuPermission'
    })
  }
  clickHandler = () => {
    this.props.dispatch({
      type: 'group/syncPermission'
    })
  }
  getTagColor = () => {
    // 随机标签颜色
    const colorList = ['#108ee9']
    const randomNum = Math.floor(Math.random()*(colorList.length))
    return colorList[randomNum]
  }
  render() {
    const { form: { getFieldDecorator }, group: { menuPermissionData }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.clickHandler}
          className={styles.button}
          icon='sync'
          >
          同步权限
        </Button>
        <span>
          <span className='box element'></span> 元素
          <span className='box menu'></span> 菜单
          <span className='box api'></span> 接口
        </span>
        <Table columns={this.columns}  dataSource={menuPermissionData}  bordered pagination={false} rowKey='id'/>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'group/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    group: state.group,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Group))
