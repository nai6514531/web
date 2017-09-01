import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import AdPosition from 'bundle-loader?lazy!../../views/advertisement/ad-position/index.js'
import AdPositionEdit from 'bundle-loader?lazy!../../views/advertisement/ad-position/edit.js'
import AdConfig from 'bundle-loader?lazy!../../views/advertisement/ad-config/index.js'
import AdConfigEdit from 'bundle-loader?lazy!../../views/advertisement/ad-config/edit.js'
import AdOrder from 'bundle-loader?lazy!../../views/advertisement/ad-config/order.js'
import adPositionModal from 'bundle-loader?lazy!../../models/advertisement/ad-position/index.js'
import adConfigModal from 'bundle-loader?lazy!../../models/advertisement/ad-config/index.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/advertisement/position-manager' component={getComponent(AdPosition,app,adPositionModal)} />
      <Route exact path='/advertisement/position-manager/:id' component={getComponent(AdPositionEdit,app,adPositionModal)} />
      <Route exact path='/advertisement/config' component={getComponent(AdConfig,app,adConfigModal)} />
      <Route exact path='/advertisement/config/order' component={getComponent(AdOrder,app,adConfigModal)} />
      <Route exact path='/advertisement/config/:id' component={getComponent(AdConfigEdit,app,adConfigModal)} />
    </Switch>
  )
}
