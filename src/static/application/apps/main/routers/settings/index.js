import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

//admin
import AdminUser from 'bundle-loader?lazy!../../views/settings/admin/user'
import AdminUserEdit from 'bundle-loader?lazy!../../views/settings/admin/user/edit'
import adminUserModel from 'bundle-loader?lazy!../../models/settings/admin/user.js'

import AdminRole from 'bundle-loader?lazy!../../views/settings/admin/role'
import adminRoleModel from 'bundle-loader?lazy!../../models/settings/admin/role.js'
import AdminAssignPermission from 'bundle-loader?lazy!../../views/settings/admin/role/assign-permission.js'
import adminAssignPermissionModel from 'bundle-loader?lazy!../../models/settings/admin/assign-permission.js'

//普通用户

import User from 'bundle-loader?lazy!../../views/settings/user'
import UserEdit from 'bundle-loader?lazy!../../views/settings/user/edit'
import userModel from 'bundle-loader?lazy!../../models/settings/user.js'

import Role from 'bundle-loader?lazy!../../views/settings/role'
import roleModel from 'bundle-loader?lazy!../../models/settings/role.js'
import AssignPermission from 'bundle-loader?lazy!../../views/settings/role/assign-permission.js'
import assignPermissionModel from 'bundle-loader?lazy!../../models/settings/assign-permission.js'

import Menu from 'bundle-loader?lazy!../../views/settings/menu'
import menuModel from 'bundle-loader?lazy!../../models/settings/menu.js'

import Password from 'bundle-loader?lazy!../../views/settings/password'
import Permission from 'bundle-loader?lazy!../../views/settings/permission'
import permissionModel from 'bundle-loader?lazy!../../models/settings/permission.js'

import Group from 'bundle-loader?lazy!../../views/settings/group'
import GroupDetail from 'bundle-loader?lazy!../../views/settings/group/detail'
import groupModel from 'bundle-loader?lazy!../../models/settings/group.js'

import Action from 'bundle-loader?lazy!../../views/settings/action'
import actionModel from 'bundle-loader?lazy!../../models/settings/action.js'

import Element from 'bundle-loader?lazy!../../views/settings/element'
import elementModel from 'bundle-loader?lazy!../../models/settings/element.js'

import LoginLog from 'bundle-loader?lazy!../../views/settings/log/login-log.js'
import ActionLog from 'bundle-loader?lazy!../../views/settings/log/action-log.js'
import ActionLogDetail from 'bundle-loader?lazy!../../views/settings/log/action-log-detail.js'
import LogModel from 'bundle-loader?lazy!../../models/settings/log.js'

export default function (app) {
  return (
    <Switch>
      {/*默认登录后首页/admin*/}
      <Route exact path='/admin' render={() => <div />} />
      {/* 管理员 */}
      <Route exact path='/admin' render={() => <div />} />
      <Route exact path='/admin/settings/admin-user' component={getComponent(AdminUser,app,adminUserModel)} />
      <Route exact path='/admin/settings/admin-user/:id' component={getComponent(AdminUserEdit,app,adminUserModel)} />
      <Route exact path='/admin/settings/admin-role' component={getComponent(AdminRole,app,adminRoleModel)} />
      <Route exact path='/admin/settings/admin-role/:id/assign-permission' component={getComponent(AdminAssignPermission,app,adminAssignPermissionModel)} />
      {/* 普通用户 */}
      <Route exact path='/admin/settings/user' component={getComponent(User,app,userModel)} />
      <Route exact path='/admin/settings/user/:id' component={getComponent(UserEdit,app,userModel)} />
      <Route exact path='/admin/settings/role' component={getComponent(Role,app,roleModel)} />
      <Route exact path='/admin/settings/role/:id/assign-permission' component={getComponent(AssignPermission,app,assignPermissionModel)} />

      <Route exact path='/admin/settings/menu' component={getComponent(Menu,app,menuModel)} />
      <Route exact path='/admin/settings/permission-group' component={getComponent(Group,app,groupModel)} />
      <Route exact path='/admin/settings/permission-group/:id' component={getComponent(GroupDetail,app,groupModel)} />
      <Route exact path='/admin/settings/permission' component={getComponent(Permission,app,permissionModel)} />
      <Route exact path='/admin/settings/change-password' component={getComponent(Password,app,userModel)} />
      <Route exact path='/admin/settings/action' component={getComponent(Action,app,actionModel)} />
      <Route exact path='/admin/settings/element' component={getComponent(Element,app,elementModel)} />
      <Route exact path='/admin/settings/login-logs' component={getComponent(LoginLog,app,LogModel)} />
      <Route exact path='/admin/settings/action-logs/:id' component={getComponent(ActionLogDetail,app,LogModel)} />
      <Route exact path='/admin/settings/action-logs' component={getComponent(ActionLog,app,LogModel)} />
    </Switch>
  )
}
