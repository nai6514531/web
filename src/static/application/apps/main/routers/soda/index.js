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

import WalletLog from 'bundle-loader?lazy!../../views/soda/walletlog/'
import WalletLogModel from 'bundle-loader?lazy!../../models/soda/walletlog/index.js'

import MngUser from 'bundle-loader?lazy!../../views/soda/user/mng/'
import MngUserModel from 'bundle-loader?lazy!../../models/soda/user/mng/'

import MngUserDetail from 'bundle-loader?lazy!../../views/soda/user/mng/detail/'
import MngUserDetailModel from 'bundle-loader?lazy!../../models/soda/user/mng/detail/'

import BusinessStatistics from 'bundle-loader?lazy!../../views/soda/statistics/soda/'
import BusinessStatisticsModel from 'bundle-loader?lazy!../../models/soda/statistics/soda/'

import ConsumeSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/soda/consume/day.js'
import ConsumeSearchDayDetail from 'bundle-loader?lazy!../../views/soda/statistics/soda/consume/day-detail.js'
import ConsumeSearchDayDevice from 'bundle-loader?lazy!../../views/soda/statistics/soda/consume/device-detail.js'
import DeviceSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/soda/device/day.js'


import DrinkingBusinessStatistics from 'bundle-loader?lazy!../../views/soda/statistics/soda-drinking/'
import DrinkingBusinessStatisticsModel from 'bundle-loader?lazy!../../models/soda/statistics/soda-drinking/'

import DrinkingConsumeSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/soda-drinking/consume/day.js'
import DrinkingConsumeSearchDayDetail from 'bundle-loader?lazy!../../views/soda/statistics/soda-drinking/consume/day-detail.js'
import DrinkingConsumeSearchDayDevice from 'bundle-loader?lazy!../../views/soda/statistics/soda-drinking/consume/device-detail.js'
import DrinkingDeviceSearchByDay from 'bundle-loader?lazy!../../views/soda/statistics/soda-drinking/device/day.js'

import OperationStatisticsByDay from 'bundle-loader?lazy!../../views/soda/statistics/soda/operation/day.js'
import OperationStatisticsByMonth from 'bundle-loader?lazy!../../views/soda/statistics/soda/operation/month.js'
import OperationStatisticsModel from 'bundle-loader?lazy!../../models/soda/statistics/soda/operation.js'

import Bill from 'bundle-loader?lazy!../../views/soda/business/bill'
import BillDetailList from 'bundle-loader?lazy!../../views/soda/business/bill/detail'
import DailyBill from 'bundle-loader?lazy!../../views/soda/business/daily-bill'
import DailyDetailBill from 'bundle-loader?lazy!../../views/soda/business/daily-bill/detail'

import Account from 'bundle-loader?lazy!../../views/soda/account'
import AccountDetail from 'bundle-loader?lazy!../../views/soda/account/detail'
import AccountEdit from 'bundle-loader?lazy!../../views/soda/account/edit'

import Staff from 'bundle-loader?lazy!../../views/soda/account/staff'
import StaffEdit from 'bundle-loader?lazy!../../views/soda/account/staff/edit'
import UserModel from 'bundle-loader?lazy!../../models/settings/user.js'

import ChipcardDetail from 'bundle-loader?lazy!../../views/soda/business/chipcard/detail'
import ChipcardRechargeList from 'bundle-loader?lazy!../../views/soda/business/chipcard'

import BusinessDevice from 'bundle-loader?lazy!../../views/soda/business/device'
import BusinessDeviceDrinking from 'bundle-loader?lazy!../../views/soda/business/device/drinking'
import BusinessDeviceLog from 'bundle-loader?lazy!../../views/soda/business/device/drinking/log'
import DeviceEdit from 'bundle-loader?lazy!../../views/soda/business/device/edit'
import DeviceBatchEdit from 'bundle-loader?lazy!../../views/soda/business/device/edit/batch'

import DeviceAddress from 'bundle-loader?lazy!../../views/soda/business/device/address'
import DeviceAddressEdit from 'bundle-loader?lazy!../../views/soda/business/device/address/edit'

import SettlementPay from 'bundle-loader?lazy!../../views/soda/settlement/bill'
import SettlementReport from 'bundle-loader?lazy!../../views/soda/settlement/report'
import BillsDetail from 'bundle-loader?lazy!../../views/soda/settlement/bill/daily'
import DailyBillsDetail from 'bundle-loader?lazy!../../views/soda/settlement/bill/detail'

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

      <Route exact path='/soda/walletlog/:mobile*' component={getComponent(WalletLog, app, WalletLogModel)} />

      <Route exact path='/soda-drinking/statistics' component={getComponent(DrinkingBusinessStatistics,app,DrinkingBusinessStatisticsModel)} />
      <Route exact path='/soda-drinking/statistics/consume/:month' component={getComponent(DrinkingConsumeSearchByDay,app,DrinkingBusinessStatisticsModel)} />
      <Route exact path='/soda-drinking/statistics/consume/:month/:day' component={getComponent(DrinkingConsumeSearchDayDetail,app,DrinkingBusinessStatisticsModel)} />
      <Route exact path='/soda-drinking/statistics/consume/:month/:day/:deviceSerial' component={getComponent(DrinkingConsumeSearchDayDevice,app,DrinkingBusinessStatisticsModel)} />
      <Route exact path='/soda-drinking/statistics/device/:month/:deviceSerial' component={getComponent(DrinkingDeviceSearchByDay,app,DrinkingBusinessStatisticsModel)} />

      <Route exact path='/soda/operation-statistics' component={getComponent(OperationStatisticsByMonth,app,OperationStatisticsModel)} />
      <Route exact path='/soda/operation-statistics/:month' component={getComponent(OperationStatisticsByDay,app,OperationStatisticsModel)} />

      <Route exact path='/soda/account/edit/:id' component={getComponent(AccountEdit,　app)} />
      <Route exact path='/soda/account/add' component={getComponent(AccountEdit,　app)} />
      <Route exact path='/soda/account/sub' component={getComponent(Account,　app)} />
      <Route exact path='/soda/account' component={getComponent(AccountDetail,　app)} />
      <Route exact path='/soda/account/staff' component={getComponent(Staff,app,UserModel)} />
      <Route exact path='/soda/account/staff/:id' component={getComponent(StaffEdit,app,UserModel)} />

      <Route exact path='/soda/business/bill/:id' component={getComponent(BillDetailList,　app)} />
      <Route exact path='/soda/business/bill' component={getComponent(Bill,　app)} />
      <Route exact path='/soda/business/bill/detail' component={getComponent(BillDetailList,　app)} />
      <Route exact path='/soda/business/daily-bill/:id' component={getComponent(DailyDetailBill,　app)} />
      <Route exact path='/soda/business/daily-bill' component={getComponent(DailyBill,　app)} />

      <Route path='/soda/business/chipcard/:id' component={getComponent(ChipcardDetail,　app)} />
      <Route path='/soda/business/recharges-chipcard' component={getComponent(ChipcardRechargeList,　app)} />

      <Route path='/soda/business/device/address/edit/:id' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda/business/device/address/add' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda/business/device/address' component={getComponent(DeviceAddress,　app)} />

      <Route path='/soda/business/device/edit/:serial' component={getComponent(DeviceEdit,　app)} />
      <Route path='/soda/business/device/add' component={getComponent(DeviceEdit,　app)} />
      <Route path='/soda/business/device/edit' component={getComponent(DeviceBatchEdit,　app)} />
      <Route path='/soda/business/device/:serial' component={getComponent(DeviceDetail,app,DeviceDetailModel)} />
      <Route path='/soda/business/device' component={getComponent(BusinessDevice,　app)} />

      <Route exact path='/soda/settlement/report' component={getComponent(SettlementReport,　app)} />
      <Route exact path='/soda/settlement/alipay' component={getComponent(SettlementPay,　app)} />
      <Route exact path='/soda/settlement/wechat' component={getComponent(SettlementPay,　app)} />
      <Route exact path='/soda/settlement/bills/:id' component={getComponent(BillsDetail,　app)} />
      <Route exact path='/soda/settlement/daily-bills/:id' component={getComponent(DailyBillsDetail,　app)} />

      <Route exact path='/soda-drinking/account/edit/:id' component={getComponent(AccountEdit,　app)} />
      <Route exact path='/soda-drinking/account/add' component={getComponent(AccountEdit,　app)} />
      <Route exact path='/soda-drinking/account/sub' component={getComponent(Account,　app)} />
      <Route exact path='/soda-drinking/account' component={getComponent(AccountDetail,　app)} />
      <Route exact path='/soda-drinking/account/staff' component={getComponent(Staff,app,UserModel)} />
      <Route exact path='/soda-drinking/account/staff/:id' component={getComponent(StaffEdit,app,UserModel)} />

      <Route path='/soda-drinking/device/address/edit/:id' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda-drinking/device/address/add' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda-drinking/device/address' component={getComponent(DeviceAddress,　app)} />

      <Route path='/soda-drinking/business/device/address/edit/:id' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda-drinking/business/device/address/add' component={getComponent(DeviceAddressEdit,　app)} />
      <Route path='/soda-drinking/business/device/address' component={getComponent(DeviceAddress,　app)} />

      <Route path='/soda-drinking/business/device/edit/:serial' component={getComponent(DeviceEdit,　app)} />
      <Route path='/soda-drinking/business/device/add' component={getComponent(DeviceEdit,　app)} />
      <Route path='/soda-drinking/business/device/edit' component={getComponent(DeviceBatchEdit,　app)} />
      <Route path='/soda-drinking/business/device/:serial' component={getComponent(DeviceDetail,app,DeviceDetailModel)} />
      <Route path='/soda-drinking/business/device' component={getComponent(BusinessDeviceDrinking,　app)} />
      <Route path='/soda-drinking/business/device-config' component={getComponent(BusinessDeviceLog,　app)} />

      <Route exact path='/soda-drinking/business/daily-bill/:id' component={getComponent(DailyDetailBill,　app)} />
      <Route exact path='/soda-drinking/business/daily-bill' component={getComponent(DailyBill,　app)} />

       <Route exact path='/soda-drinking/consume' component={getComponent(Consume,app,ConsumeModel)} />
      <Route exact path='/soda-drinking/consume/:id' component={getComponent(ConsumeDetail,app,ConsumeDetailModel)} />

    </Switch>
  )
}
