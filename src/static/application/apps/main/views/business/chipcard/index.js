import React, { Component }from 'react'
import _ from 'underscore'
import moment from 'moment'
import querystring from 'querystring'
import { Link } from 'react-router-dom'

import { Affix, Input, Spin, Button, Form, Table, Icon, Popconfirm, Select, DatePicker, message, Modal } from 'antd'
const Option = Select.Option
const confirm = Modal.confirm
const FormItem = Form.Item

import { InputClear } from '../../../components/form/input'
import Breadcrumb from '../../../components/layout/breadcrumb'
import ChipcardService from '../../../services/soda-manager/chipcard'
import history from '../../../utils/history'
import { conversionUnit } from '../../../utils/functions'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '运营商管理',
    url: '/business/account'
  },
  {
    title: 'IC卡金额转移'
  }
]

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 7,
    },
  },
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      recharges: [],
      loading: false,
      visible: false,
      search: {
        mobile: '',
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      rechargeLoading: false,
      applyLoading: false,
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
      }, {
        title: '学生登录手机号',
        dataIndex: 'mobile',
        render: (mobile, record) => {
          return <Link to={`/business/chipcard/${record.chipcardId}`}>{mobile}</Link>
        }
      }, {
        title: '充值金额(元)',
        dataIndex: 'value',
        render: (value) => {
          return `${conversionUnit(value)}`
        }
      }, {
        title: '充值时间',
        dataIndex: 'createdAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm:SS')
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)

    let search = _.pick(query, 'mobile')
    let pagination = _.pick(query, 'limit', 'offset')
    this.list({search, pagination})
  }
  list({...options}) {
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = {...this.state.search, ...search}
    pagination = {...this.state.pagination, ...pagination}
    this.setState({ searchLoading: true, loading: true, search, pagination })

    ChipcardService.list({...search, ..._.pick(pagination, 'limit', 'offset')}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        recharges: data.objects || [],
        pagination: {
          ...pagination,
          total: data.pagination.total
        },
        loading: false
      })
    }).catch((err) => {
      this.setState({ recharges: [], loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { search } = this.state
    let pagination = { offset: 0 }

    this.changeHistory(pagination)
    this.list({pagination})
  }
  changeMobile (e) {
    const val = e.target.value || ''
    this.setState({ search: {...this.state.search, mobile: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  changeHistory ({...options}) {
    let query = _.pick({ ...this.state.search, ...this.state.pagination, ...options }, 'offset', 'limit', 'mobile')
    this.props.history.push(`/business/recharges-chipcard?${querystring.stringify(query)}`)
  }
  pagination () {
    let self = this
    let { pagination: { total, offset, limit } } = this.state
    return {
      total: total,
      current: parseInt(offset / limit) + 1,
      pageSize: parseInt(limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (data) {
        return <span>总计 {data} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { limit: pageSize, offset: offset }
    		self.changeHistory(pagination)
        self.list({pagination})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { offset: offset }
    		self.changeHistory(pagination)
        self.list({pagination})
      }
    }
  }
  onBlurMobile(e) {
    let { applyLoading } = this.state
    let { form: { setFieldsValue } } = this.props
    let mobile = e.target.value || ''

    if (/^1\d{10}$/.test(mobile) && !applyLoading) {
      this.setState({ applyLoading: true })
      ChipcardService.getDetail({ mobile: mobile }).then((res) => {
        this.setState({ applyLoading: false })
        // 该手机号无匹配IC卡
        if (res.code === '01020301') {
          return
        }
        if (res.status !== 'OK') {
          throw new Error(res.message)
        }
        let data = res.data
        let apply = _.map(data.apply || [], (value) => { return `${value.account}` }).join(',')
        setFieldsValue({ apply: apply })

      }).catch((err) => {
        this.setState({ applyLoading: false })
        message.error(err.message || '服务器异常，刷新重试')
      })
    }
  }
  checkValue(rule, value, callback) {
    value = value || ''
    let number = Number(value || '')
    let integer = value.split('.')[0]
    let portion = value.split('.')[1] || ''

    if (isNaN(number) || number <= 0) {
      return callback('请输入正确的金额')
    }
    // 校验有0开头的数字
    if (integer >0 && integer.replace(/\b(0+)/g,"") !== integer) {
      return callback('请输入正确的金额')
    }
    if (number > 500) {
      return callback('不可超过500元');
    }
    if (portion.length > 2) {
      return callback('金额不允许超过小数点后两位');
    }
    return callback()
  }
  handleSubmit(e) {
    e.preventDefault()
    let self = this
    let { form: { validateFieldsAndScroll } } = this.props
    let { rechargeLoading } = this.state

    validateFieldsAndScroll((err, values) => {
      if (err || rechargeLoading) {
        return
      }
      let options = {
        mobile: values.mobile,
        value: values.value * 100,
        apply: _.without(values.apply.replace(/，/g,",").split(","), '')
      }
      confirm({
        title: '请仔细检查手机号与金额是否正确，确认充值吗?',
        content: `手机号: ${options.mobile}, 金额: ${conversionUnit(options.value)} 元`,
        onOk() {
          self.recharge(options);
        }
      })
    })
  }
  recharge(options) {
    let pagination = { offset: 0 }
    this.setState({ rechargeLoading: true })

    ChipcardService.recharge(options).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        visible: false,
        rechargeLoading: false
      })
      this.changeHistory(pagination)
      this.list({pagination})
    }).catch((err) => {
      this.setState({ rechargeLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  render() {
    let { form: { getFieldDecorator } } = this.props
    let { recharges, loading, rechargeLoading, visible, search: { mobile } } = this.state
    let pagination = this.pagination()

    return (<section className={styles.view}>
      <Breadcrumb items={breadItems} />
      <div>
        <InputClear
          value={mobile}
          style={{ width: 160, marginRight: 10, marginBottom: 10 }}
          placeholder='请输入手机号'
          onChange={this.changeMobile.bind(this)}
          onPressEnter={this.search.bind(this)}
        />
        <Button type='primary' style={{ marginBottom: 10, marginRight: 10 }} loading={loading} icon='search' onClick={this.search.bind(this)}>筛选</Button>
        <Button type='primary' style={{ marginBottom: 10, backgroundColor: "#ED9D51", borderColor: "#ED9D51" }} onClick={() => { this.setState({ visible: true })}}>充值</Button>
      </div>
      <Table
        style= {{ marginTop: 16 }}
        scroll={{ x: 900 }}
        dataSource={recharges}
        columns={this.columns}
        pagination={pagination}
        rowKey={record => record.id}
        loading={loading}
      />
      {
        visible ?
        <Modal
          visible={visible}
          footer={null}
          onCancel={() => { this.setState({ visible: false })}}>
          <Spin spinning={rechargeLoading}>
            <Form onSubmit={this.handleSubmit.bind(this)} className={styles.form}>
              <FormItem
                {...formItemLayout}
                label="学生登录手机号">
                {getFieldDecorator("mobile", {
                  rules: [
                    { required: true, message: "手机号不可为空"},
                    { len: 11, message: '请输入11位手机号' },
                    { type: 'string', pattern: /^1\d{10}$/, message: '请输入正确的手机号'}
                  ],
                })(
                  <Input placeholder="请输入手机号" onBlur={this.onBlurMobile.bind(this)}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="充值金额(元)">
                {getFieldDecorator("value", {
                  rules: [{
                    required: true, message: "金额不可为空",
                  }, {
                    validator: this.checkValue.bind(this)
                  }],
                })(
                  <Input placeholder="请输入充值金额" />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="适用商家账号">
                {getFieldDecorator("apply", {
                  rules: [{
                    required: true, message: "账号不可为空",
                  }],
                })(
                  <Input placeholder="如有多个账号，需用英文逗号隔开" />
                )}
              </FormItem>
              <FormItem {...tailFormItemLayout}>
                <p className={styles.tip}>充值金额只可用于适用商家名下的设备</p>
              </FormItem>
              <FormItem
                {...tailFormItemLayout}
                style={{textAlign: "center"}}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  disabled={rechargeLoading}
                  loading={rechargeLoading}>
                  充值
                </Button>
              </FormItem>
            </Form>
          </Spin>
        </Modal> : null
      }
    </section>)
  }
}

export default Form.create()(App)
