import React, { Component } from 'react'
import { render } from 'react-dom'
import { Menu, Icon, Layout } from 'antd'
const SubMenu = Menu.SubMenu;
class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: '1',
      openKeys: []
    }
  }
  handleClick = (e) => {
    this.props.dispatch({ type: 'ui/popMenu', payload: { visible: false } })
    this.setState({ current: e.key })
  }
  onOpenChange = (openKeys) => {
    const state = this.state;
    const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
    const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }
    this.setState({ openKeys: nextOpenKeys });

  }
  getAncestorKeys = (key) => {
    const map = {
      sub3: ['sub2'],
      sub5: ['sub4'],
    };
    return map[key] || [];
  }
  render() {
    const { current, openKeys } = this.state
    return (
      <Menu
        mode='inline'
        selectedKeys ={[current]}
        onClick={this.handleClick}
        openKeys={openKeys}
        onOpenChange={this.onOpenChange}
        theme={this.props.theme ? this.props.theme : 'dark'}
      >
        <SubMenu key="sub1" title={<span><Icon type="mail" /><span>Navigation One</span></span>}>
           <Menu.Item key="1">Option 1</Menu.Item>
           <Menu.Item key="2">Option 2</Menu.Item>
           <Menu.Item key="3">Option 3</Menu.Item>
           <Menu.Item key="4">Option 4</Menu.Item>
         </SubMenu>
         <SubMenu key="sub2" title={<span><Icon type="appstore" /><span>Navigation Two</span></span>}>
           <Menu.Item key="5">Option 5</Menu.Item>
           <Menu.Item key="6">Option 6</Menu.Item>
           <SubMenu key="sub3" title="Submenu">
             <Menu.Item key="7">Option 7</Menu.Item>
             <Menu.Item key="8">Option 8</Menu.Item>
           </SubMenu>
         </SubMenu>
         <SubMenu key="sub4" title={<span><Icon type="setting" /><span>Navigation Three</span></span>}>
           <Menu.Item key="9">Option 9</Menu.Item>
           <Menu.Item key="10">Option 10</Menu.Item>
           <SubMenu key="sub5" title="Submenu">
             <Menu.Item key="11">Option 11</Menu.Item>
             <Menu.Item key="12">Option 12</Menu.Item>
           </SubMenu>
         </SubMenu>
      </Menu>
    )
  }
}
export default SideBar
