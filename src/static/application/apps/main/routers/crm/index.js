import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Consume from 'bundle-loader?lazy!../../views/crm/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/crm/consume/'
import Sms from 'bundle-loader?lazy!../../views/crm/sms/'
import SmsModel from 'bundle-loader?lazy!../../models/crm/sms/'
import Device from 'bundle-loader?lazy!../../views/crm/device/'
import DeviceModel from 'bundle-loader?lazy!../../models/crm/device/'
import Customer from 'bundle-loader?lazy!../../views/crm/search/customer/'
import CustomerModel from 'bundle-loader?lazy!../../models/crm/search/customer/'
import BillDetail from 'bundle-loader?lazy!../../views/crm/search/customer/bill/'
import BillDetailModel from 'bundle-loader?lazy!../../models/crm/search/customer/bill.js'
import chipcardDetail from 'bundle-loader?lazy!../../views/crm/search/customer/chipcard/'
import chipcardDetailModel from 'bundle-loader?lazy!../../models/crm/search/customer/chipcard.js'
import Operator from 'bundle-loader?lazy!../../views/crm/search/operator/'
import OperatorModel from 'bundle-loader?lazy!../../models/crm/search/operator/'
import OperatorDetail from 'bundle-loader?lazy!../../views/crm/search/operator/detail/'
import OperatorDetailModel from 'bundle-loader?lazy!../../models/crm/search/operator/detail/'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/crm/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/crm/sms' component={getComponent(Sms,app,SmsModel)} />
      <Route exact path='/crm/device' component={getComponent(Device,app,DeviceModel)} />
      <Route exact path='/crm/search/customer' component={getComponent(Customer,app,CustomerModel)} />
      <Route exact path='/crm/search/operator' component={getComponent(Operator,app,OperatorModel)} />
      <Route exact path='/crm/search/operator/:id' component={getComponent(OperatorDetail,app,OperatorDetailModel)} />
      <Route exact path='/crm/:id/bill' component={getComponent(BillDetail,app,BillDetailModel)} />
      <Route exact path='/crm/:id/chipcard' component={getComponent(chipcardDetail,app,chipcardDetailModel)} />
    </Switch>
  )
}
