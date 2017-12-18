import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import City from 'bundle-loader?lazy!../../views/2/city/'
import cityModel from 'bundle-loader?lazy!../../models/2/city/city.js'

import Channel from 'bundle-loader?lazy!../../views/2/channel/'
import channelModel from 'bundle-loader?lazy!../../models/2/channel/index.js'

import ChannelEdit from 'bundle-loader?lazy!../../views/2/channel/edit/'
import channelEditModel from 'bundle-loader?lazy!../../models/2/channel/edit/index.js'

import ChannelDetail from 'bundle-loader?lazy!../../views/2/channel/detail/'
// import channelDetailModel from 'bundle-loader?lazy!../../models/2/channel/detail/index.js'
import ChannelOrder from 'bundle-loader?lazy!../../views/2/channel/order/'
// import channelOrderModel from 'bundle-loader?lazy!../../models/2/channel/order/index.js'
//
import Topic from 'bundle-loader?lazy!../../views/2/topic/topic.js'
import topicModel from 'bundle-loader?lazy!../../models/2/topic/topic.js'

import TopicDetail from 'bundle-loader?lazy!../../views/2/topic/detail/index.js'
import topicDetailModel from 'bundle-loader?lazy!../../models/2/topic/topic-detail.js'
import TopicEdit from 'bundle-loader?lazy!../../views/2/topic/edit/index.js'
import topicEditModel from 'bundle-loader?lazy!../../models/2/topic/topic-edit.js'

import Comment from 'bundle-loader?lazy!../../views/2/comment/index.js'
import CommentEdit from 'bundle-loader?lazy!../../views/2/comment/edit/index.js'
import CommentModel from 'bundle-loader?lazy!../../models/2/comment/comment.js'
import CommentEditModel from 'bundle-loader?lazy!../../models/2/comment/comment-edit.js'

import Reply from 'bundle-loader?lazy!../../views/2/reply/index.js'
import ReplyEdit from 'bundle-loader?lazy!../../views/2/reply/edit/index.js'
import ReplyModel from 'bundle-loader?lazy!../../models/2/reply/reply.js'
import ReplyEditModel from 'bundle-loader?lazy!../../models/2/reply/reply-edit.js'

import TopicLike from 'bundle-loader?lazy!../../views/2/likes/topic-like.js'
import CommentLike from 'bundle-loader?lazy!../../views/2/likes/comment-like.js'
import ReplyLike from 'bundle-loader?lazy!../../views/2/likes/reply-like.js'
import LikeModel from 'bundle-loader?lazy!../../models/2/like/like.js'
// import CommentModel from 'bundle-loader?lazy!../../models/2/comment/comment.js'
// import Reply from 'bundle-loader?lazy!../../views/2/reply/index.js'
// import usersModel from 'bundle-loader?lazy!../../models/2/user/user.js'

import Users from 'bundle-loader?lazy!../../views/2/user/index.js'
import UsersEdit from 'bundle-loader?lazy!../../views/2/user/edit/index.js'
import UsersEditModal from 'bundle-loader?lazy!../../models/2/user/userEdit.js'
import UsersDetail from 'bundle-loader?lazy!../../views/2/user/detail/index.js'
import usersModel from 'bundle-loader?lazy!../../models/2/user/user.js'

export default function (app) {
  return (
    <Switch>
      <Route exact path='/2/channel' component={getComponent(Channel,app,channelModel)} />
      <Route exact path='/2/channel/order' component={getComponent(ChannelOrder,app,channelModel)} />
      <Route exact path='/2/channel/:id' component={getComponent(ChannelEdit,app,channelEditModel)} />
      <Route exact path='/2/channel/detail/:id' component={getComponent(ChannelDetail,app,channelModel)} />
      {/*
      <Route exact path='/2/channel/:id/topic' component={getComponent(ChannelTopic,app,channelTopicModel)} />
      <Route exact path='/2/channel/:id/pending-topic' component={getComponent(ChannelPendingTopic,app,channelTopicModel)} />
      */}
      <Route exact path='/2/city' component={getComponent(City,app,cityModel)} />
      <Route exact path='/2/topic' component={getComponent(Topic,app,topicModel)} />
      <Route exact path='/2/topic/detail/:id' component={getComponent(TopicDetail,app,topicDetailModel)} />\
      <Route exact path='/2/topic/:id/like' component={getComponent(TopicLike,app,LikeModel)} />
      <Route exact path='/2/topic/:topicId/comment/:commentId/like' component={getComponent(CommentLike,app,LikeModel)} />
      <Route exact path='/2/topic/:id' component={getComponent(TopicEdit,app,topicEditModel)} />
      <Route exact path='/2/topic/:id/comment' component={getComponent(Comment,app,CommentModel)} />
      <Route exact path='/2/topic/:id/comment/new' component={getComponent(CommentEdit,app,CommentEditModel)} />
      <Route exact path='/2/topic/:topicId/comment/:commentId/reply' component={getComponent(Reply,app,ReplyModel)} />
      <Route exact path='/2/topic/:topicId/comment/:commentId/reply/new' component={getComponent(ReplyEdit,app,ReplyEditModel)} />
      <Route exact path='/2/topic/:topicId/comment/:commentId/reply/:replyId/like' component={getComponent(ReplyLike,app,LikeModel)} />
      <Route exact path='/2/users' component={getComponent(Users,app,usersModel)} />
      <Route exact path='/2/users/:id' component={getComponent(UsersEdit,app,UsersEditModal)} />
      <Route exact path='/2/users/detail/:id' component={getComponent(UsersDetail,app,usersModel)} />
    </Switch>
  )
}
