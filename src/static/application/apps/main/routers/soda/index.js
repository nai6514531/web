import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import Consume from 'bundle-loader?lazy!../../views/soda/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/soda/consume/'

import ConsumeDetail from 'bundle-loader?lazy!../../views/soda/consume/detail/'
import ConsumeDetailModel from 'bundle-loader?lazy!../../models/soda/consume/detail.js'

import BizConsumeSearch from 'bundle-loader?lazy!../../views/soda/business-consume/'
import BizConsumeSearchModel from 'bundle-loader?lazy!../../models/soda/business-consume/'

import Sms from 'bundle-loader?lazy!../../views/soda/sms/'
import SmsModel from 'bundle-loader?lazy!../../models/soda/sms/'

import Device from 'bundle-loader?lazy!../../views/soda/device/'
import OperationDetail from 'bundle-loader?lazy!../../views/soda/device/operation-detail.js'
import DeviceDetail from 'bundle-loader?lazy!../../views/soda/device/detail.js'
import DeviceModel from 'bundle-loader?lazy!../../models/soda/device/'
import DeviceDetailModel from 'bundle-loader?lazy!../../models/soda/device/detail.js'

import Customer from 'bundle-loader?lazy!../../views/soda/search/customer/'
import CustomerModel from 'bundle-loader?lazy!../../models/soda/search/customer/'

import BillDetail from 'bundle-loader?lazy!../../views/soda/search/customer/bill/'
import BillDetailModel from 'bundle-loader?lazy!../../models/soda/search/customer/bill.js'

import Chipcard from 'bundle-loader?lazy!../../views/soda/search/customer/chipcard/'
import ChipcardModel from 'bundle-loader?lazy!../../models/soda/search/customer/chipcard.js'

import Operator from 'bundle-loader?lazy!../../views/soda/search/operator/'
import OperatorModel from 'bundle-loader?lazy!../../models/soda/search/operator/'

import OperatorDetail from 'bundle-loader?lazy!../../views/soda/search/operator/detail/'
import OperatorDetailModel from 'bundle-loader?lazy!../../models/soda/search/operator/detail/'

import BusinessStatistics from 'bundle-loader?lazy!../../views/soda/statistics/'
import BusinessStatisticsModel from 'bundle-loader?lazy!../../models/soda/statistics/'

import ConsumeSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/consume/day.js'
import ConsumeSearchDayDetail from 'bundle-loader?lazy!../../views/soda/statistics/consume/day-detail.js'
import ConsumeSearchDayDevice from 'bundle-loader?lazy!../../views/soda/statistics/consume/device-detail.js'
import DeviceSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/device/day.js'


export default function (app) {
  return (
    <Switch>
      <Route exact path='/soda/statistics' component={getComponent(BusinessStatistics,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month' component={getComponent(ConsumeSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day' component={getComponent(ConsumeSearchDayDetail,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day/:deviceSerial' component={getComponent(ConsumeSearchDayDevice,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/device/:month/:deviceSerial' component={getComponent(DeviceSearchByDay,app,BusinessStatisticsModel)} />

      <Route exact path='/soda/business/consume' component={getComponent(BizConsumeSearch,app,BizConsumeSearchModel)} />
      <Route exact path='/soda/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/soda/consume/:id' component={getComponent(ConsumeDetail,app,ConsumeDetailModel)} />

      <Route exact path='/soda/sms' component={getComponent(Sms,app,SmsModel)} />

      <Route exact path='/soda/device' component={getComponent(Device,app,DeviceModel)} />
      <Route exact path='/soda/device/operation/:id' component={getComponent(OperationDetail,app,DeviceModel)} />
      <Route exact path='/soda/device/:id' component={getComponent(DeviceDetail,app,DeviceDetailModel)} />

      <Route exact path='/soda/search/customer' component={getComponent(Customer,app,CustomerModel)} />
      <Route exact path='/soda/search/operator' component={getComponent(Operator,app,OperatorModel)} />
      <Route exact path='/soda/search/operator/:id' component={getComponent(OperatorDetail,app,OperatorDetailModel)} />
      <Route exact path='/soda/:id/bill' component={getComponent(BillDetail,app,BillDetailModel)} />
      <Route exact path='/soda/:id/chipcard' component={getComponent(Chipcard,app,ChipcardModel)} />
    </Switch>
  )
}
