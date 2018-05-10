export default {
  userStatus: {
    '0': '正常',
    '1': '被拉黑'
  },
  userType: {
    '0': '真实',
    '1': '马甲'
  },
  app: {
    0: '帖子',
    1: '每日话题'
  },
  commentStatus: {
    0: '线上',
    1: '违规下线'
  },
  replyStatus: {
    0: '线上',
    1: '违规下线'
  },
  topicStatus: {
    0: '正常',
    1: '交易中',
    2: '交易完成',
    3: '后台下架',
    4: 'C端下架'
  },
  sortTypes: {
    0: '最新',
    1: '最热',
    5: '附近',
    2: '高颜值'
  },
  topicTypes:[
    {
      id: 2,
      desc: '图文'
    },
    {
      id: 3,
      desc: '打分'
    },
    {
      id: 0,
      desc: '价格'
    },
    {
      id: 1,
      desc: '每日话题'
    }
  ],
  defaultDimensions: {
    likeDisabled: 1,
    commentDisabled: 1,
    messageDisabled: 1
  }
}
