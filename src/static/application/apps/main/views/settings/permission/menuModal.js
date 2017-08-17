import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox, TreeSelect } from 'antd'
import { arrayToTree } from '../../../utils/index.js'
import _ from 'lodash'
const FormItem = Form.Item
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class MenuModal extends Component {
  hide = () => {
    this.props.dispatch({
      type: 'permission/hideModal'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const result = this.transfromData(values.result || [])
        this.props.dispatch({
          type: 'permission/updateMenu',
          payload: {
            id: this.props.permission.currentId,
            data: result
          }
        })
      }
    })
  }
  transfromData = (data) => {
    const menuData = this.props.permission.menuData || []
    const result = []
    for ( let i = 0; i < data.length; i++ ) {
      // TreeSelect组件只支持string类型
      result.push(Number(data[i]))
    }
    result.map(id => {
      menuData.map(item => {
        // 寻找父节点
        if(item.id === id) {
          if(item.parentId) {
            result.push(item.parentId)
            menuData.map( subItem => {
              if(item.parentId === subItem.id && subItem.parentId ) {
                result.push(subItem.parentId)
              }
            })
          }
        }
        // 寻找子元素
        if(item.parentId === id) {
          result.push(item.id)
          if(!item.url) {
            menuData.map( subItem => {
              if(item.id === subItem.parentId) {
                result.push(subItem.id)
              }
            })
          }
        }
      })
    })
    return _.uniq(result)
  }
  deletePanelId = (data) => {
    const menuData = this.props.permission.menuData
    const result = []
    data.map( id => {
      menuData.map( subItem => {
        if( id === subItem.id && subItem.url ) {
          result.push(String(id))
        }
      })
    })
    return result
  }
  intToString = (data) => {
    // trasform value from int to string
    return _.map(data, (item) => {
      if(item.children) {
        this.intToString(item.children)
      }
      item.value = String(item.value)
      return item
    })
  }
  render() {
    const { form: { getFieldDecorator }, permission: { menuData, menuVisible, key, currentData } } = this.props
    const menuTree = this.intToString(arrayToTree(menuData))
    const current = this.deletePanelId(currentData)
    return(
      <Modal
        title='配置菜单'
        visible={menuVisible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        key={key}
       >
        <Form>
          <FormItem>
            {getFieldDecorator(`result`,{
               initialValue: current.length ? current : null,
            })(
              <TreeSelect
                 style={{ width: 300 }}
                 dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                 treeData={menuTree}
                 placeholder='请选择'
                 treeDefaultExpandAll
                 showCheckedStrategy={SHOW_PARENT}
                 treeCheckable
                 multiple={true}
               />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
MenuModal = Form.create()(MenuModal)
export default MenuModal
