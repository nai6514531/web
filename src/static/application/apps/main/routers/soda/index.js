import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import Consume from 'bundle-loader?lazy!../../views/soda/ticket/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/soda/ticket/consume/'

import ConsumeDetail from 'bundle-loader?lazy!../../views/soda/ticket/consume/detail/'
import ConsumeDetailModel from 'bundle-loader?lazy!../../models/soda/ticket/consume/detail.js'

import BizConsumeSearch from 'bundle-loader?lazy!../../views/soda/ticket/business-consume/'
import BizConsumeSearchModel from 'bundle-loader?lazy!../../models/soda/ticket/business-consume/'

import Sms from 'bundle-loader?lazy!../../views/soda/sms/'
import SmsModel from 'bundle-loader?lazy!../../models/soda/sms/'

import Device from 'bundle-loader?lazy!../../views/soda/device/'
import OperationDetail from 'bundle-loader?lazy!../../views/soda/device/operation-detail.js'
import DeviceDetail from 'bundle-loader?lazy!../../views/soda/device/detail.js'
import DeviceModel from 'bundle-loader?lazy!../../models/soda/device/'
import DeviceDetailModel from 'bundle-loader?lazy!../../models/soda/device/detail.js'

import SodaUser from 'bundle-loader?lazy!../../views/soda/user/soda/'
import SodaUserModel from 'bundle-loader?lazy!../../models/soda/user/soda/'

import BillDetail from 'bundle-loader?lazy!../../views/soda/user/soda/bill/'
import BillDetailModel from 'bundle-loader?lazy!../../models/soda/user/soda/bill.js'

import Chipcard from 'bundle-loader?lazy!../../views/soda/user/soda/chipcard/'
import ChipcardModel from 'bundle-loader?lazy!../../models/soda/user/soda/chipcard.js'

import MngUser from 'bundle-loader?lazy!../../views/soda/user/mng/'
import MngUserModel from 'bundle-loader?lazy!../../models/soda/user/mng/'

import MngUserDetail from 'bundle-loader?lazy!../../views/soda/user/mng/detail/'
import MngUserDetailModel from 'bundle-loader?lazy!../../models/soda/user/mng/detail/'

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

      <Route exact path='/soda/user' component={getComponent(SodaUser,app,SodaUserModel)} />
      <Route exact path='/mng/user' component={getComponent(MngUser,app,MngUserModel)} />
      <Route exact path='/mng/user/:id' component={getComponent(MngUserDetail,app,MngUserDetailModel)} />

      <Route exact path='/soda/:id/bill' component={getComponent(BillDetail,app,BillDetailModel)} />
      <Route exact path='/soda/:id/chipcard' component={getComponent(Chipcard,app,ChipcardModel)} />
    </Switch>
  )
}
