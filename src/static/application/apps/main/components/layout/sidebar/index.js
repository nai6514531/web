import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Menu, Icon, Layout } from 'antd'
import { arrayToTree } from '../../../utils/'
import { session } from '../../../utils/storage.js'

const SubMenu = Menu.SubMenu

class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.levelMap = {}
  }

  componentDidMount() {
    const defaultOpenKeys = session.val('defaultOpenKeys') || []
    const defaultSelectedKeys = session.val('defaultSelectedKeys') || []
    this.props.changeOpenKeys(defaultOpenKeys)
    this.props.changeSelectedKeys(defaultSelectedKeys)
  }

  getMenus = (menuData, fold) => {
    // 生成遍历menu的数据
    const menuTree = arrayToTree(menuData)
    return menuTree.map(item => {
      if (item.children) {
        if (item.parentId) {
          this.levelMap[item.id] = item.parentId
        }
        return (
          <SubMenu
            key={item.id}
            title={<span>
              {item.icon && <Icon type={item.icon} />}
              {(!fold || item.level !== 1) && item.name}
            </span>}
          >
            {this.getMenus(item.children, fold)}
          </SubMenu>
        )
      }
      return (
        <Menu.Item key={item.id}>
          <Link
            to={item.url || ''}
            onClick={()=>{
              this.props.dispatch({
                type: 'common/resetIndex'
              })
            }}>
            {item.icon && <Icon type={item.icon} />}
            {(!fold || item.parentId !== 0) && item.name}
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
    const { handleClick, changeOpenKeys, changeSelectedKeys } = this.props
    const realPath = keyPath.reverse()
    const selectedKeys = [realPath[realPath.length-1]]
    const openKeys = realPath.slice(0, keyPath.length-1)
    session.val('defaultSelectedKeys', selectedKeys)
    session.val('defaultOpenKeys', openKeys)
    changeOpenKeys(openKeys)
    changeSelectedKeys(selectedKeys)
    handleClick && handleClick()
  }

  render() {
    const { mode, theme, fold, handleClick, navOpenKeys, selectedKeys, common: { userInfo } } = this.props
    const menuItems = this.getMenus(userInfo.menuList, fold)
    const menuProps = !fold ? {
      openKeys: navOpenKeys,
      onOpenChange: this.onOpenChange,
      selectedKeys: selectedKeys
    } : {}
    return (
      <Menu
        mode={mode}
        theme={'dark'}
        onClick={this.onClick}
        {...menuProps}
      >
        {menuItems}
      </Menu>
    )
  }
}
export default SideBar
