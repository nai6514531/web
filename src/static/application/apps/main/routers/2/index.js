import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Circle from 'bundle-loader?lazy!../../views/2/circle/'
import circleModel from 'bundle-loader?lazy!../../models/2/circle/circle.js'
import Channel from 'bundle-loader?lazy!../../views/2/channel/'
import channelModel from 'bundle-loader?lazy!../../models/2/channel/index.js'
import ChannelEdit from 'bundle-loader?lazy!../../views/2/channel/edit/'
import channelEditModel from 'bundle-loader?lazy!../../models/2/channel/edit/index.js'
import ChannelDetail from 'bundle-loader?lazy!../../views/2/channel/detail/'
// import channelDetailModel from 'bundle-loader?lazy!../../models/2/channel/detail/index.js'
import ChannelOrder from 'bundle-loader?lazy!../../views/2/channel/order/'
// import channelOrderModel from 'bundle-loader?lazy!../../models/2/channel/order/index.js'
import ChannelTopic from 'bundle-loader?lazy!../../views/2/channel/topic/'
import ChannelPendingTopic from 'bundle-loader?lazy!../../views/2/channel/pending-topic/'
import channelTopicModel from 'bundle-loader?lazy!../../models/2/channel/topic/'
import Topic from 'bundle-loader?lazy!../../views/2/circle/topic.js'
import topicModel from 'bundle-loader?lazy!../../models/2/circle/topic.js'
import TopicDetail from 'bundle-loader?lazy!../../views/2/circle/topic-detail.js'
import topicDetailModel from 'bundle-loader?lazy!../../models/2/circle/topic-detail.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/2/channel' component={getComponent(Channel,app,channelModel)} />
      <Route exact path='/2/channel/order' component={getComponent(ChannelOrder,app,channelModel)} />
      <Route exact path='/2/channel/:id' component={getComponent(ChannelEdit,app,channelEditModel)} />
      <Route exact path='/2/channel/detail/:id' component={getComponent(ChannelDetail,app,channelModel)} />
      <Route exact path='/2/channel/:id/topic' component={getComponent(ChannelTopic,app,channelTopicModel)} />
      <Route exact path='/2/channel/:id/pending-topic' component={getComponent(ChannelPendingTopic,app,channelTopicModel)} />
      <Route exact path='/2/circle' component={getComponent(Circle,app,circleModel)} />
      <Route exact path='/2/topic' component={getComponent(Topic,app,topicModel)} />
      <Route exact path='/2/topic/:id' component={getComponent(TopicDetail,app,topicDetailModel)} />
    </Switch>
  )
}
