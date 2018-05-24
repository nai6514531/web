import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import Consume from 'bundle-loader?lazy!../../views/soda/ticket/consume/'
import ConsumeModel from 'bundle-loader?lazy!../../models/soda/ticket/consume/'

import ConsumeDetail from 'bundle-loader?lazy!../../views/soda/ticket/consume/detail/'
import ConsumeDetailModel from 'bundle-loader?lazy!../../models/soda/ticket/consume/detail.js'

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

import Bonus from 'bundle-loader?lazy!../../views/soda/user/soda/bonus/'
import BonusModel from 'bundle-loader?lazy!../../models/soda/user/soda/bonus.js'

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

import OperationStatisticsByDay from 'bundle-loader?lazy!../../views/soda/statistics/operation/day.js'
import OperationStatisticsByMonth from 'bundle-loader?lazy!../../views/soda/statistics/operation/month.js'
import OperationStatisticsModel from 'bundle-loader?lazy!../../models/soda/statistics/operation.js'

import bill from 'bundle-loader?lazy!../../views/soda/business/bill'
import billDetailList from 'bundle-loader?lazy!../../views/soda/business/bill/detail'
import dailyBill from 'bundle-loader?lazy!../../views/soda/business/daily-bill'
import dailyDetailBill from 'bundle-loader?lazy!../../views/soda/business/daily-bill/detail'
import account from 'bundle-loader?lazy!../../views/soda/business/account'
import accountDetail from 'bundle-loader?lazy!../../views/soda/business/account/detail'
import accountEdit from 'bundle-loader?lazy!../../views/soda/business/account/edit'

import chipcardDetail from 'bundle-loader?lazy!../../views/soda/business/chipcard/detail'
import chipcardRechargeList from 'bundle-loader?lazy!../../views/soda/business/chipcard'

import device from 'bundle-loader?lazy!../../views/soda/business/device'
import deviceEdit from 'bundle-loader?lazy!../../views/soda/business/device/edit'
import deviceBatchEdit from 'bundle-loader?lazy!../../views/soda/business/device/edit/batch'

import deviceAddress from 'bundle-loader?lazy!../../views/soda/business/device/address'
import deviceAddressEdit from 'bundle-loader?lazy!../../views/soda/business/device/address/edit'

import settlementPay from 'bundle-loader?lazy!../../views/soda/settlement/bill'
import settlementReport from 'bundle-loader?lazy!../../views/soda/settlement/report'
import billsDetail from 'bundle-loader?lazy!../../views/soda/settlement/bill/daily'
import dailyBillsDetail from 'bundle-loader?lazy!../../views/soda/settlement/bill/detail'

export default function (app) {
  return (
    <Switch>
      <Route exact path='/soda/statistics' component={getComponent(BusinessStatistics,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month' component={getComponent(ConsumeSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day' component={getComponent(ConsumeSearchDayDetail,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day/:deviceSerial' component={getComponent(ConsumeSearchDayDevice,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/device/:month/:deviceSerial' component={getComponent(DeviceSearchByDay,app,BusinessStatisticsModel)} />

      <Route exact path='/soda/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/soda/consume/:id' component={getComponent(ConsumeDetail,app,ConsumeDetailModel)} />

      <Route exact path='/soda/sms' component={getComponent(Sms,app,SmsModel)} />

      <Route exact path='/soda/device' component={getComponent(Device,app,DeviceModel)} />
      <Route exact path='/soda/device/operation/:id' component={getComponent(OperationDetail,app,DeviceModel)} />
      <Route exact path='/soda/device/:serial' component={getComponent(DeviceDetail,app,DeviceDetailModel)} />

      <Route exact path='/soda/user' component={getComponent(SodaUser,app,SodaUserModel)} />
      <Route exact path='/mng/user' component={getComponent(MngUser,app,MngUserModel)} />
      <Route exact path='/mng/user/:id' component={getComponent(MngUserDetail,app,MngUserDetailModel)} />

      <Route exact path='/soda/user/:id/bill' component={getComponent(BillDetail,app,BillDetailModel)} />
      <Route exact path='/soda/user/:id/chipcard' component={getComponent(Chipcard,app,ChipcardModel)} />
      <Route exact path='/soda/user/:id/bonus' component={getComponent(Bonus,app,BonusModel)} />

      <Route exact path='/soda/statistics' component={getComponent(BusinessStatistics,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month' component={getComponent(ConsumeSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day' component={getComponent(ConsumeSearchDayDetail,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/consume/:month/:day/:deviceSerial' component={getComponent(ConsumeSearchDayDevice,app,BusinessStatisticsModel)} />
      <Route exact path='/soda/statistics/device/:month/:deviceSerial' component={getComponent(DeviceSearchByDay,app,BusinessStatisticsModel)} />

      <Route exact path='/soda/operation-statistics' component={getComponent(OperationStatisticsByMonth,app,OperationStatisticsModel)} />
      <Route exact path='/soda/operation-statistics/:month' component={getComponent(OperationStatisticsByDay,app,OperationStatisticsModel)} />

      <Route exact path='/soda/business/account/edit/:id' component={getComponent(accountEdit,　app)} />
      <Route exact path='/soda/business/account/add' component={getComponent(accountEdit,　app)} />
      <Route exact path='/soda/business/account/sub' component={getComponent(account,　app)} />
      <Route exact path='/soda/business/account' component={getComponent(accountDetail,　app)} />
      <Route exact path='/soda/business/bill/:id' component={getComponent(billDetailList,　app)} />
      <Route exact path='/soda/business/bill' component={getComponent(bill,　app)} />
      <Route exact path='/soda/business/bill/detail' component={getComponent(billDetailList,　app)} />
      <Route exact path='/soda/business/daily-bill/:id' component={getComponent(dailyDetailBill,　app)} />
      <Route exact path='/soda/business/daily-bill' component={getComponent(dailyBill,　app)} />

      <Route path='/soda/business/chipcard/:id' component={getComponent(chipcardDetail,　app)} />
      <Route path='/soda/business/recharges-chipcard' component={getComponent(chipcardRechargeList,　app)} />

      <Route path='/soda/business/device/address/edit/:id' component={getComponent(deviceAddressEdit,　app)} />
      <Route path='/soda/business/device/address/add' component={getComponent(deviceAddressEdit,　app)} />
      <Route path='/soda/business/device/address' component={getComponent(deviceAddress,　app)} />

      <Route path='/soda/business/device/edit/:serial' component={getComponent(deviceEdit,　app)} />
      <Route path='/soda/business/device/add' component={getComponent(deviceEdit,　app)} />
      <Route path='/soda/business/device/edit' component={getComponent(deviceBatchEdit,　app)} />
      <Route path='/soda/business/device/:serial' component={getComponent(DeviceDetail,app,DeviceDetailModel)} />
      <Route path='/soda/business/device' component={getComponent(device,　app)} />

      <Route exact path='/soda/settlement/report' component={getComponent(settlementReport,　app)} />
      <Route exact path='/soda/settlement/alipay' component={getComponent(settlementPay,　app)} />
      <Route exact path='/soda/settlement/wechat' component={getComponent(settlementPay,　app)} />
      <Route exact path='/soda/settlement/bills/:id' component={getComponent(billsDetail,　app)} />
      <Route exact path='/soda/settlement/daily-bills/:id' component={getComponent(dailyBillsDetail,　app)} />
    </Switch>
  )
}
