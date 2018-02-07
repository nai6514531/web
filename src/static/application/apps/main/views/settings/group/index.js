import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Tag, Table } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import styles from '../../../assets/css/search-bar.pcss'
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
      { title: '菜单名', dataIndex: 'name',key: 'name',className: 'td-left' },
      {
        title: '权限名',
        width: 700,
        render: (text, record, index) => {
          if(!record.permission) {
            return (
              <span>/</span>
            )
          }
          return (
            <span>
               {
                 record.permission.map(value => <Tag style={{ margin: '3px' }} color={this.getTagColor()} key={value.id}>{ value.name }</Tag> )
               }
            </span>
          )
        }
      },
      {
        title: '操作',
        width: 100,
        render: (text, record, index) => {
          // if(!record.url) {
          //   return (
          //     <span>/

          //     </span>
          //   )
          // }
          return (
            <Link
              to={`/admin/settings/group/${record.id}?name=${record.name}`}>
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
