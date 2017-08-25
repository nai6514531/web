import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Circle from 'bundle-loader?lazy!../../views/2/circle/'
import circleModel from 'bundle-loader?lazy!../../models/2/circle/circle.js'
import Topic from 'bundle-loader?lazy!../../views/2/circle/topic.js'
import topicModel from 'bundle-loader?lazy!../../models/2/circle/topic.js'
import TopicDetail from 'bundle-loader?lazy!../../views/2/circle/topic-detail.js'
import topicDetailModel from 'bundle-loader?lazy!../../models/2/circle/topic-detail.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/2/circle' component={getComponent(Circle,app,circleModel)} />
      <Route exact path='/2/topic' component={getComponent(Topic,app,topicModel)} />
      <Route exact path='/2/topic/:id' component={getComponent(TopicDetail,app,topicDetailModel)} />
    </Switch>
  )
}
