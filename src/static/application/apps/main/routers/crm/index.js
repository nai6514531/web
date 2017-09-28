import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Consume from 'bundle-loader?lazy!../../views/crm/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/crm/consume/'
import Device from 'bundle-loader?lazy!../../views/crm/device/'
import DeviceModel from 'bundle-loader?lazy!../../models/crm/device/'
import Customer from 'bundle-loader?lazy!../../views/crm/search/customer/'
import CustomerModel from 'bundle-loader?lazy!../../models/crm/search/customer/'
import WalletDetail from 'bundle-loader?lazy!../../views/crm/search/customer/wallet/'
import WalletDetailModel from 'bundle-loader?lazy!../../models/crm/search/customer/wallet.js'
import chipcardDetail from 'bundle-loader?lazy!../../views/crm/search/customer/chipcard/'
import chipcardDetailModel from 'bundle-loader?lazy!../../models/crm/search/customer/chipcard.js'
import Operator from 'bundle-loader?lazy!../../views/crm/search/operator/'
import OperatorModel from 'bundle-loader?lazy!../../models/crm/search/operator/'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/crm/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/crm/device' component={getComponent(Device,app,DeviceModel)} />
      <Route exact path='/crm/search/customer' component={getComponent(Customer,app,CustomerModel)} />
      <Route exact path='/crm/search/operator' component={getComponent(Operator,app,OperatorModel)} />
      <Route exact path='/crm/search/operator' component={getComponent(Operator,app,OperatorModel)} />
      <Route exact path='/crm/wallet/:id' component={getComponent(WalletDetail,app,WalletDetailModel)} />
      <Route exact path='/crm/chipcard/:id' component={getComponent(chipcardDetail,app,chipcardDetailModel)} />
    </Switch>
  )
}
