import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Menu, Icon, Layout } from 'antd'
import { arrayToTree, queryArray } from '../../../utils/'
import { storage, session } from '../../../utils/storage.js'

const SubMenu = Menu.SubMenu

class SideBar extends React.Component {
  constructor(props) {
    super(props)
    const userInfo = storage.val('userInfo')
    this.levelMap = {}
    this.menu = userInfo ? userInfo.menuList : [],
    this.defaultSelectedKeys = session.val('defaultSelectedKeys') || []
  }
  componentDidMount() {
    const defaultOpenKeys = session.val('defaultOpenKeys') || []
    this.props.changeOpenKeys(defaultOpenKeys)
  }
  getMenus = (menuData, siderFoldN) => {
    // 生成遍历menu的数据
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
              {(!siderFoldN || item.pid !== 0) && item.name}
            </span>}
          >
            {this.getMenus(item.children, siderFoldN)}
          </SubMenu>
        )
      }
      return (
        <Menu.Item key={item.id}>
          <Link to={item.url}>
            {item.icon && <Icon type={item.icon} />}
            {(!siderFoldN || item.pid !== 0) && item.name}
          </Link>
        </Menu.Item>
      )
    })
  }
  onOpenChange = (openKeys) => {
    const { navOpenKeys, changeOpenKeys } = this.props
    const latestOpenKey = openKeys.find(key => !(navOpenKeys.indexOf(key) > -1))
    const latestCloseKey = navOpenKeys.find(key => !(openKeys.indexOf(key) > -1))

    let nextOpenKeys = []
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey)
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey)
    }
    changeOpenKeys(nextOpenKeys)

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
  onClick = ({item, key, keyPath}) => {
    const { handleClick, changeOpenKeys } = this.props
    const realPath = keyPath.reverse()
    const selectedKeys = [realPath[realPath.length-1]]
    const openKeys = realPath.slice(0, keyPath.length-1)
    session.val('defaultSelectedKeys', selectedKeys)
    session.val('defaultOpenKeys', openKeys)
    changeOpenKeys(openKeys)
    handleClick && handleClick()
  }
  render() {
    const { mode, theme, common: { fold }, handleClick, navOpenKeys } = this.props
    const menuItems = this.getMenus(this.menu, fold)
    const menuProps = !fold ? {
      openKeys: navOpenKeys,
      onOpenChange: this.onOpenChange
    } : {}
    return (
      <Menu
        mode={mode}
        theme={theme ? theme : 'dark'}
        onClick={this.onClick}
        defaultSelectedKeys={this.defaultSelectedKeys}
        {...menuProps}
      >
        {menuItems}
      </Menu>
    )
  }
}
export default SideBar
