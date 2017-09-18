import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Consume from 'bundle-loader?lazy!../../views/crm/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/crm/consume/'
import Device from 'bundle-loader?lazy!../../views/crm/device/'
import DeviceModel from 'bundle-loader?lazy!../../models/crm/device/'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/crm/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/crm/device' component={getComponent(Device,app,DeviceModel)} />
    </Switch>
  )
}
