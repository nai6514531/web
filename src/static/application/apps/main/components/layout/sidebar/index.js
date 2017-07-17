import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Menu, Icon, Layout } from 'antd'
import { arrayToTree } from '../../../utils/'
import menuData from './test.js'
const SubMenu = Menu.SubMenu
class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: '1',
      openKeys: []
    },
    this.levelMap = {}
  }
  getMenus = (menuData, siderFoldN) => {
    const menuTree = arrayToTree(menuData, 'id', 'pid')
    return menuTree.map(item => {
      if (item.children) {
        if (item.pid) {
          this.levelMap[item.id] = item.pid
        }
        return (
          <SubMenu
            key={item.id}
            title={<span>
              {item.icon && <Icon type={item.icon} />}
              {(!siderFoldN || menuTree.indexOf(item) < 0) && item.name}
            </span>}
          >
            {this.getMenus(item.children, siderFoldN)}
          </SubMenu>
        )
      }
      return (
        <Menu.Item key={item.id}>
          <Link to={item.router}>
            {item.icon && <Icon type={item.icon} />}
            {(!siderFoldN || menuTree.indexOf(item) < 0) && item.name}
          </Link>
        </Menu.Item>
      )
    })
  }
  handleClick = (e) => {
    this.props.dispatch({ type: 'ui/popMenu', payload: { visible: false } })
    this.setState({ current: e.key })
  }
  onOpenChange = (openKeys) => {
    const state = this.state
    const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1))
    const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1))

    let nextOpenKeys = []
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey)
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey)
    }
    this.setState({ openKeys: nextOpenKeys })

  }
  getAncestorKeys = (key) => {
    let map = {}
    let levelMap = this.levelMap
    const getParent = (index) => {
      const result = [String(levelMap[index])]
      if (levelMap[result[0]]) {
        result.unshift(getParent(result[0])[0])
      }
      return result
    }
    for (let index in levelMap) {
      if ({}.hasOwnProperty.call(levelMap, index)) {
        map[index] = getParent(index)
      }
    }
    return map[key] || []
  }
  render() {
    const { current, openKeys } = this.state
    const { mode, theme } = this.props
    const menuItems = this.getMenus(menuData, mode !== 'inline')
    let attribute
    if(mode == 'inline') {
      attribute = {
        mode,
        openKeys,
        theme: theme ? theme : 'dark',
        selectedKeys: [current],
        onClick: this.handleClick,
        onOpenChange: this.onOpenChange
      }
    } else {
      attribute = {
        mode,
        theme: theme ? theme : 'dark',
        selectedKeys: [current],
        onClick: this.handleClick,
      }
    }
    return (
      <Menu
        { ...attribute }
      >
        {menuItems}
      </Menu>
    )
  }
}
export default SideBar
