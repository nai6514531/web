import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Tree, Cascader, Form, Modal, Input, Button, Popconfirm, Collapse } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { arrayToTree, transformMenu, generateData } from '../../../utils/'

const FormItem = Form.Item
const Panel = Collapse.Panel
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
    title: '菜单'
  }
]
const TreeNode = Tree.TreeNode

class Menu extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '菜单名', dataIndex: 'name',key: 'name' },
      { title: '菜单别名', dataIndex: 'alias', key: 'alias' },
      { title: '图标', dataIndex: 'icon', key: 'icon' },
      { title: '路由', dataIndex: 'url', key: 'url' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑</a>
              {/* <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm> */}
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'menu/list'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { cascader } = values
        const id = this.props.menu.record.id
        let type = 'menu/add'
        values.parentId = cascader[cascader.length - 1]
        values.level = cascader.length
        if(id) {
          type = 'menu/update'
        }
        this.props.dispatch({
          type: type,
          payload: {
            data: values,
            id: id
          }
        })
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'menu/hideModal'
    })
  }
  show = (record) => {
    // 暂时支持到三级菜单
    this.transformRecord(record)
    this.props.dispatch({
      type: 'menu/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'menu/delete',
      payload: {
        id: id
      }
    })
  }
  transformRecord = (record) => {
    const parentId = record.parentId
    const level = record.level
    if( level === 1 ) {
      record.cascader = [0] //present parentId
    } else {
      this.options[0].children.map( item  => {
        if( parentId === item.id && level === 2 ) {
          record.cascader = [0, parentId]
        }
        if(item.children) {
          item.children.map( subItem => {
            if( parentId === subItem.id ) {
              record.cascader = [0, subItem.parentId, parentId]
            }
          })
        }
      })
    }
  }
  onDragEnter = (info) => {
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // })
  }
  onDrop = (info) => {
    const { eventKey: dropKey, pos: targetNode } = info.node.props
    const { eventKey: dragKey, pos: dragNode } = info.dragNode.props
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const dragList = dragNode.split('-')
    const targetList = targetNode.split('-')
    const currentPos = dragNode.slice(0, dragNode.length - dragList[dragList.length - 1].length)
    const targetPos = targetNode.slice(0, targetNode.length - targetList[targetList.length - 1].length)

    if(currentPos !== targetPos || !info.dropToGap ) {
      // 判断是否是同级并且是否拖拽到了空隙位置
      return
    }
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.id == key) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }
    const data = [...this.props.menu.treeData]
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })
    if (info.dropToGap) {
      let ar
      let i
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i - 1, 0, dragObj)
      }
    } else {
      // loop(data, dropKey, (item) => {
      //   item.children = item.children || []
      //   // where to insert 示例添加到尾部，可以是随意位置
      //   item.children.push(dragObj)
      // })
    }
    this.props.dispatch({
      type: 'menu/updateData',
      payload: {
        treeData: data
      }
    })
  }
  order = () => {
    const treeData = [...this.props.menu.treeData]
    const orignData = [...this.props.menu.data.objects]
    const order = []
    const loop = (data,preKey) => {
      data.forEach((item, index, arr) => {
        index = index + 1
        if(item.level === 1) {
          order.push({
            id: item.id,
            position: index * 10000
          })
        }
        const result = order.find((ele) => {
          return ele.id === item.parentId
        })
        if(result) {
          if(item.level === 2) {
            order.push({
              id: item.id,
              position: result.position + index * 100
            })
          }
          if(item.level === 3) {
            order.push({
              id: item.id,
              position: result.position + index
            })
          }
        }
        if (item.children) {
          return loop(item.children)
        }
      })
    }
    loop(treeData)
    this.props.dispatch({
      type: 'menu/order',
      payload: {
        data: order
      }
    })
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, menu: { key, visible, record, data: { objects, pagination }, treeData }, loading  } = this.props
    this.options = transformMenu(objects)

    const title = record.id ? '编辑菜单' : '添加菜单'
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode key={item.id} title={item.name}>{loop(item.children)}</TreeNode>
      }
      return <TreeNode key={item.id} title={item.name} leaf={true}/>
    })
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this, {})}
          style={{marginBottom: '20px'}}
          >
          添加菜单
        </Button>
        <Collapse style={{ marginBottom: '20px' }}>
          <Panel header="菜单排序" key="1">
            <Button
              type='primary'
              onClick={this.order}
              style={{marginBottom: '20px'}}
              >
              同步到现网
            </Button>
            <Tree
              showLine
              className="draggable-tree"
              draggable
              onDragEnter={this.onDragEnter}
              onDrop={this.onDrop}
            >
              {loop(treeData)}
            </Tree>
          </Panel>
        </Collapse>
        <DataTable
          scroll={{ x: 600 }}
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={true}
        />
        <Modal
          title={title}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          afterClose={this.reset}
         >
          <Form onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label='菜单名'
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true, message: '请输入菜单名!',
                  }],
                  initialValue: record.name
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label='菜单别名'
              >
                {getFieldDecorator('alias', {
                  rules: [{
                    required: true, message: '请输入菜单别名!',
                  }],
                  initialValue: record.alias
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label='图标'
              >
                {getFieldDecorator('icon', {
                  rules: [{
                    required: true, message: '请输入图标!',
                  }],
                  initialValue: record.icon
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label='路由'
              >
                {getFieldDecorator('url', {
                  initialValue: record.url
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label='父节点'
              >
                {getFieldDecorator('cascader', {
                  initialValue: record.cascader,
                  rules: [{
                    required: true, message: '请选择根节点',
                  }],
                })(
                  <Cascader options={this.options} changeOnSelect placeholder='请选择'/>
                )}
              </FormItem>
            </Form>
         </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'menu/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    menu: state.menu,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Menu))
