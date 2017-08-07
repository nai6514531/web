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
        const result = this.transfromData(values.result)
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
    const menuData = this.props.permission.menuData
    const result = []
    for ( let i = 0; i < data.length; i++ ) {
      result.push(Number(data[i]))
    }
    result.map( id => {
      // 判断是否是panel,是的话找出所有panel的父节点和子节点
      // 不是的话只找出父节点
      menuData.map( item => {
        if(item.id === id) {
          if(item.parentId) {
            result.push(item.parentId)
          }
        }
        if( item.parentId === id ) {
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
        title="配置菜单"
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
